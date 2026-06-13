import { beforeEach, describe, expect, it } from 'vitest';
import type { GameState } from '../domain/game/types';
import { createCardLossEvent, defaultProfile, useGameStore } from './useGameStore';

describe('useGameStore profile', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState({
      game: null,
      playerCount: 4,
      botDifficulty: 'medium',
      profile: defaultProfile(),
      achievements: defaultProfile().achievements,
      achievementToast: null,
      profileMatchResult: null,
    });
  });

  it('defaults to the dark theme when localStorage has no saved setting', () => {
    expect(useGameStore.getState().theme).toBe('dark');
  });

  it('records a human win and unlocks untouchable when an action completes the match with no lost cards', () => {
    useGameStore.getState().startGame();
    const game = useGameStore.getState().game!;
    const humanId = game.config.humanPlayerId;
    const target = game.players.find((player) => player.kind === 'bot')!;

    useGameStore.setState({
      game: {
        ...game,
        currentPlayerId: humanId,
        players: game.players.map((player) => {
          if (player.id === humanId) {
            return { ...player, money: 7 };
          }
          if (player.id === target.id) {
            return {
              ...player,
              cards: player.cards.map((card, index) => ({ ...card, status: index === 0 ? 'alive' : 'revealed' })),
            };
          }
          return {
            ...player,
            cards: player.cards.map((card) => ({ ...card, status: 'revealed' })),
          };
        }),
      },
    });

    useGameStore.getState().act({ type: 'eliminate', actorId: humanId, targetId: target.id });

    expect(useGameStore.getState().game?.phase).toBe('complete');
    expect(useGameStore.getState().profile.lifetimeWins).toBe(1);
    expect(useGameStore.getState().profile.currentStreak).toBe(1);
    expect(useGameStore.getState().achievements.unlocked.untouchable).toBeDefined();
  });

  it('saves pending human choices so a reload can resume the prompt', () => {
    useGameStore.getState().startGame();
    const game = useGameStore.getState().game!;
    const humanId = game.config.humanPlayerId;
    const bot = game.players.find((player) => player.kind === 'bot')!;

    useGameStore.setState({
      game: {
        ...game,
        currentPlayerId: bot.id,
        players: game.players.map((player) =>
          player.id === bot.id ? { ...player, money: 3 } : player,
        ),
      },
    });

    useGameStore.getState().act({ type: 'attack', actorId: bot.id, targetId: humanId });

    const saved = localStorage.getItem('who-is-lying:game');

    expect(useGameStore.getState().game?.pendingChoice?.kind).toBe('revealCard');
    expect(saved).toBeTruthy();
    expect(saved ? JSON.parse(decodeURIComponent(atob(saved))).pendingChoice.kind : null).toBe('revealCard');
  });

  it('asks eliminated humans whether to spectate or restart', () => {
    useGameStore.getState().startGame();
    const game = useGameStore.getState().game!;
    const humanId = game.config.humanPlayerId;
    const bot = game.players.find((player) => player.kind === 'bot')!;

    useGameStore.setState({
      game: {
        ...game,
        currentPlayerId: bot.id,
        players: game.players.map((player) => {
          if (player.id === humanId) {
            return {
              ...player,
              cards: player.cards.map((card, index) => ({ ...card, status: index === 0 ? 'revealed' : 'alive' })),
            };
          }
          if (player.id === bot.id) {
            return { ...player, money: 3 };
          }
          return player;
        }),
      },
    });

    useGameStore.getState().act({ type: 'attack', actorId: bot.id, targetId: humanId });

    expect(useGameStore.getState().spectatorMode).toBe('choose');
  });

  it('does not enter spectator mode while a proven human card is waiting for replacement', () => {
    useGameStore.getState().startGame();
    const game = useGameStore.getState().game!;
    const humanId = game.config.humanPlayerId;
    const bot = game.players.find((player) => player.kind === 'bot')!;

    useGameStore.setState({
      game: {
        ...game,
        currentPlayerId: humanId,
        deck: [
          { id: 'replacement-1', role: 'thief', status: 'alive' },
          { id: 'replacement-2', role: 'helper', status: 'alive' },
        ],
        players: game.players.map((player) => {
          if (player.id === humanId) {
            return {
              ...player,
              cards: [
                { id: 'human-ceo', role: 'leader', status: 'alive' },
              ],
            };
          }
          if (player.id === bot.id) {
            return {
              ...player,
              cards: [
                { id: 'bot-spy', role: 'helper', status: 'alive' },
              ],
            };
          }
          return player;
        }),
      },
      spectatorMode: null,
    });

    useGameStore.getState().act({
      type: 'challenge',
      actorId: humanId,
      challengerId: bot.id,
      claimedRole: 'leader',
      originalAction: { type: 'tax', actorId: humanId },
    });

    expect(useGameStore.getState().game?.pendingChoice?.kind).toBe('replaceProvenCard');
    expect(useGameStore.getState().spectatorMode).toBeNull();

    useGameStore.getState().act({ type: 'chooseReplacementCard', playerId: humanId, cardId: 'replacement-1' });

    expect(useGameStore.getState().spectatorMode).toBeNull();
    expect(useGameStore.getState().game?.currentPlayerId).not.toBe(humanId);
  });

  it('builds a detailed challenge event for the challenge popup', () => {
    useGameStore.getState().startGame();
    const game = useGameStore.getState().game!;
    const humanId = game.config.humanPlayerId;
    const bot = game.players.find((player) => player.kind === 'bot')!;

    useGameStore.setState({
      game: {
        ...game,
        currentPlayerId: bot.id,
        players: game.players.map((player) =>
          player.id === bot.id
            ? {
                ...player,
                cards: [
                  { id: 'bot-thief', role: 'thief', status: 'alive' },
                  { id: 'bot-helper', role: 'helper', status: 'alive' },
                ],
              }
            : player,
        ),
      },
    });

    useGameStore.getState().act({
      type: 'challenge',
      actorId: bot.id,
      challengerId: humanId,
      claimedRole: 'leader',
      originalAction: { type: 'tax', actorId: bot.id },
    });

    expect(useGameStore.getState().challengeEvent).toMatchObject({
      challenger: 'You',
      actor: bot.name,
      claimedRole: 'leader',
      originalActionType: 'tax',
      targetName: null,
      loserName: bot.name,
      outcome: 'liar',
    });
  });

  it('creates a card loss event when a card is removed without a reveal status change', () => {
    const prev = cardLossState();
    const next: GameState = {
      ...prev,
      players: prev.players.map((player) =>
        player.id === 'player-2'
          ? { ...player, cards: [{ id: 'b1', role: 'leader', status: 'alive' }] }
          : player,
      ),
    };

    expect(createCardLossEvent(prev, next, { type: 'attack', actorId: 'player-1', targetId: 'player-2' })).toMatchObject({
      playerId: 'player-2',
      playerName: 'Bot A',
      role: 'helper',
      actionType: 'attack',
      eliminated: false,
    });
  });

  it('does not create a card loss event for a public reveal status change', () => {
    const prev = cardLossState();
    const next: GameState = {
      ...prev,
      players: prev.players.map((player) =>
        player.id === 'player-2'
          ? { ...player, cards: player.cards.map((card, index) => ({ ...card, status: index === 0 ? 'revealed' as const : card.status })) }
          : player,
      ),
    };

    expect(createCardLossEvent(prev, next, {
      type: 'challenge',
      actorId: 'player-2',
      challengerId: 'player-1',
      claimedRole: 'leader',
      originalAction: { type: 'tax', actorId: 'player-2' },
    })).toBeNull();
  });
});

const cardLossState = (): GameState => ({
  id: 'loss-test',
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
  currentPlayerId: 'player-1',
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
        { id: 'b1', role: 'leader', status: 'alive' },
        { id: 'b2', role: 'helper', status: 'alive' },
      ],
    },
  ],
  deck: [],
  log: [],
  turnCount: 0,
  botMemory: {},
  pendingChoice: null,
});
