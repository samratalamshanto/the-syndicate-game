import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GameState } from '../../domain/game/types';
import { emptyMemory, getBotMemory, memoryAdjustedChallengeProbability, observeBotMemory, resetBotMemory } from './botMemory';
import { hardBot, mediumBot, pickTarget } from './localBots';

const stateWithHelperBot = (): GameState => ({
  id: 'bot-test',
  config: {
    playerCount: 3,
    humanPlayerId: 'player-1',
    startingMoney: 2,
    maxMoney: 10,
    cardsPerPlayer: 2,
    roleCopies: {
      leader: 3,
      officer: 3,
      thief: 3,
      helper: 3,
      reporter: 3,
    },
    botDifficulty: 'medium',
  },
  currentPlayerId: 'player-2',
  phase: 'action',
  winnerId: null,
  players: [
    {
      id: 'player-1',
      name: 'You',
      kind: 'human',
      money: 2,
      cards: [
        { id: 'h1', role: 'leader', status: 'alive' },
        { id: 'h2', role: 'officer', status: 'alive' },
      ],
    },
    {
      id: 'player-2',
      name: 'Bot A',
      kind: 'bot',
      money: 2,
      cards: [
        { id: 'b1', role: 'helper', status: 'alive' },
        { id: 'b2', role: 'reporter', status: 'alive' },
      ],
    },
    {
      id: 'player-3',
      name: 'Bot B',
      kind: 'bot',
      money: 2,
      cards: [
        { id: 'b3', role: 'leader', status: 'alive' },
        { id: 'b4', role: 'thief', status: 'alive' },
      ],
    },
  ],
  deck: [],
  log: [],
  turnCount: 0,
  botMemory: {},
  pendingChoice: null,
});

describe('local bot strategy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetBotMemory();
  });

  it('lets a bot with Helper choose Exchange', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    expect(mediumBot.chooseAction(stateWithHelperBot(), 'player-2')).toEqual({
      type: 'exchange',
      actorId: 'player-2',
    });
  });

  it('lets a bot block with a matching role', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.2);

    expect(mediumBot.chooseReaction(stateWithHelperBot(), 'player-2', {
      type: 'steal',
      actorId: 'player-1',
      targetId: 'player-3',
    })).toEqual({
      kind: 'block',
      blockingRole: 'helper',
    });
  });

  it('challenges role claims on hard mode at the configured rate', () => {
    let index = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => (index++ % 200) / 200);

    const challenges = Array.from({ length: 200 }).filter(
      () => hardBot.chooseReaction(stateWithHelperBot(), 'player-2', { type: 'tax', actorId: 'player-1' }).kind === 'challenge',
    ).length;

    expect(challenges).toBeGreaterThanOrEqual(40);
    expect(challenges).toBeLessThanOrEqual(100);
  });

  it('raises hard-bot challenge pressure when memory says the human bluffs a role', () => {
    const memory = emptyMemory();
    memory.humanRoleClaims.leader = 3;
    memory.humanBluffsCaught.leader = 2;

    const nextCeoClaim = memoryAdjustedChallengeProbability(0.32, 1, 'leader', memory);
    const aggressiveAction = memoryAdjustedChallengeProbability(0.32, 1, 'officer', memory);

    expect(nextCeoClaim).toBeGreaterThan(aggressiveAction * 1.5);
  });

  it('counts a caught human bluff after the two-card reveal choice resolves', () => {
    const prev = stateWithHelperBot();
    prev.currentPlayerId = 'player-1';
    prev.pendingChoice = {
      kind: 'revealCard',
      playerId: 'player-1',
      cause: 'challenge_lost',
      mode: 'reveal',
      followUp: null,
      source: {
        actorId: 'player-2',
        actionType: 'challenge',
        claimedRole: 'leader',
      },
    };
    const next = {
      ...prev,
      pendingChoice: null,
      players: prev.players.map((player) =>
        player.id === 'player-1'
          ? {
              ...player,
              cards: player.cards.map((card, index) => ({ ...card, status: index === 0 ? 'revealed' as const : card.status })),
            }
          : player,
      ),
      log: [{ id: 'log-1', messageKey: 'challenge.actorLost', values: { actor: 'You', challenger: 'Bot A', role: 'leader' } }],
    };

    observeBotMemory(prev, next, { type: 'chooseRevealCard', playerId: 'player-1', cardId: 'h1' });

    expect(getBotMemory().humanBluffsCaught.leader).toBe(1);
  });

  it('counts a caught human block bluff after the two-card reveal choice resolves', () => {
    const prev = stateWithHelperBot();
    prev.currentPlayerId = 'player-2';
    prev.pendingChoice = {
      kind: 'revealCard',
      playerId: 'player-1',
      cause: 'block_lost',
      mode: 'reveal',
      followUp: { type: 'attack', actorId: 'player-2', targetId: 'player-1' },
      source: {
        actorId: 'player-2',
        actionType: 'challenge',
        claimedRole: 'reporter',
      },
    };
    const next = {
      ...prev,
      pendingChoice: null,
      players: prev.players.map((player) =>
        player.id === 'player-1'
          ? {
              ...player,
              cards: player.cards.map((card, index) => ({ ...card, status: index === 0 ? 'revealed' as const : card.status })),
            }
          : player,
      ),
      log: [{ id: 'log-1', messageKey: 'challenge.actorLost', values: { actor: 'You', challenger: 'Bot A', role: 'reporter' } }],
    };

    observeBotMemory(prev, next, { type: 'chooseRevealCard', playerId: 'player-1', cardId: 'h1' });

    expect(getBotMemory().humanBluffsCaught.reporter).toBe(1);
  });

  it('lets hard bots counter-challenge a human block', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1);

    expect(hardBot.chooseCounterChallenge(stateWithHelperBot(), 'player-2', 'helper')).toBe(true);
  });

  it('holds hard-mode eliminate at 7 money unless a last-card target is available', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const state = stateWithHelperBot();
    state.players[1] = { ...state.players[1], money: 7 };

    expect(hardBot.chooseAction(state, 'player-2').type).not.toBe('eliminate');

    state.players[0] = {
      ...state.players[0],
      cards: state.players[0].cards.map((card, index) => ({ ...card, status: index === 0 ? 'alive' : 'revealed' })),
    };
    expect(hardBot.chooseAction(state, 'player-2').type).toBe('eliminate');
  });

  it('does not always target the first eligible player', () => {
    const state = stateWithHelperBot();
    state.players = Array.from({ length: 8 }, (_, index) => ({
      id: `player-${index + 1}`,
      name: index === 0 ? 'You' : `Bot ${index}`,
      kind: index === 0 ? 'human' : 'bot',
      money: 2,
      cards: [
        { id: `c${index}-1`, role: 'leader', status: 'alive' },
        { id: `c${index}-2`, role: 'helper', status: 'alive' },
      ],
    }));
    const bot = state.players[3];
    let index = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => ((index++ * 37) % 100) / 100);

    const counts = new Map<string, number>();
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const target = pickTarget(state, bot, 'attack');
      counts.set(target.id, (counts.get(target.id) ?? 0) + 1);
    }

    expect(counts.get('player-1') ?? 0).toBeLessThan(70);
    expect(counts.size).toBeGreaterThan(3);
  });

  it('makes aggressive personas choose attacks far more often than cautious personas', () => {
    const attackReadyState = (personaId: string) => {
      const state = stateWithHelperBot();
      state.players[1] = {
        ...state.players[1],
        personaId,
        money: 3,
        cards: [
          { id: `${personaId}-1`, role: 'reporter', status: 'alive' },
          { id: `${personaId}-2`, role: 'helper', status: 'alive' },
        ],
      };
      return state;
    };
    const countAttacks = (personaId: string) => {
      let index = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => ((index++ * 37) % 100) / 100);
      const count = Array.from({ length: 200 }).filter(
        () => hardBot.chooseAction(attackReadyState(personaId), 'player-2').type === 'attack',
      ).length;
      vi.restoreAllMocks();
      return count;
    };

    expect(countAttacks('iron')).toBeGreaterThan(countAttacks('whisper') * 2);
  });
});
