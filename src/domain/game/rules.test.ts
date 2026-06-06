import { describe, expect, it } from 'vitest';
import {
  createGame,
  getPlayerView,
  resolveAction,
  resolveChallenge,
} from './engine';
import type { GameConfig, GameState } from './types';

const config: GameConfig = {
  playerCount: 4,
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
};

const riggedState = (): GameState => ({
  id: 'test-game',
  config,
  currentPlayerId: 'player-1',
  phase: 'action',
  winnerId: null,
  players: [
    {
      id: 'player-1',
      name: 'You',
      kind: 'human',
      money: 9,
      cards: [
        { id: 'c1', role: 'leader', status: 'alive' },
        { id: 'c2', role: 'officer', status: 'alive' },
      ],
    },
    {
      id: 'player-2',
      name: 'Bot A',
      kind: 'bot',
      money: 0,
      cards: [
        { id: 'c3', role: 'thief', status: 'alive' },
        { id: 'c4', role: 'helper', status: 'alive' },
      ],
    },
    {
      id: 'player-3',
      name: 'Bot B',
      kind: 'bot',
      money: 5,
      cards: [
        { id: 'c5', role: 'reporter', status: 'alive' },
        { id: 'c6', role: 'leader', status: 'alive' },
      ],
    },
    {
      id: 'player-4',
      name: 'Bot C',
      kind: 'bot',
      money: 2,
      cards: [
        { id: 'c7', role: 'thief', status: 'revealed' },
        { id: 'c8', role: 'helper', status: 'alive' },
      ],
    },
  ],
  deck: [
    { id: 'd1', role: 'leader', status: 'alive' },
    { id: 'd2', role: 'officer', status: 'alive' },
    { id: 'd3', role: 'reporter', status: 'alive' },
  ],
  log: [],
  botMemory: {},
  pendingChoice: null,
});

describe('game engine', () => {
  it('creates a game with starting cards, money, bots, and clockwise turn order', () => {
    const game = createGame(config, () => 0.1);

    expect(game.players).toHaveLength(4);
    expect(game.players[0].money).toBe(2);
    expect(game.players.every((player) => player.cards.length === 2)).toBe(true);
    expect(game.currentPlayerId).toBe('player-1');
    expect(game.botMemory).toEqual({});
  });

  it('caps money at 10 and hides opponent totals from a player view', () => {
    const afterTax = resolveAction(riggedState(), {
      type: 'tax',
      actorId: 'player-1',
    });
    const view = getPlayerView(afterTax, 'player-1');

    expect(afterTax.players[0].money).toBe(10);
    expect(view.players.find((player) => player.id === 'player-1')?.money).toBe(10);
    expect(view.players.find((player) => player.id === 'player-2')?.money).toBeNull();
  });

  it('steals only available money from the target', () => {
    const noMoneySteal = resolveAction(riggedState(), {
      type: 'steal',
      actorId: 'player-1',
      targetId: 'player-2',
    });
    const oneMoneyState = riggedState();
    oneMoneyState.players[1].money = 1;
    const oneMoneySteal = resolveAction(oneMoneyState, {
      type: 'steal',
      actorId: 'player-1',
      targetId: 'player-2',
    });

    expect(noMoneySteal.players[0].money).toBe(9);
    expect(noMoneySteal.players[1].money).toBe(0);
    expect(oneMoneySteal.players[0].money).toBe(10);
    expect(oneMoneySteal.players[1].money).toBe(0);
  });

  it('removes one card for a 7-money eliminate action', () => {
    const state = riggedState();
    state.players[1].cards[0].status = 'revealed';
    const next = resolveAction(state, {
      type: 'eliminate',
      actorId: 'player-1',
      targetId: 'player-2',
    });

    expect(next.players[0].money).toBe(2);
    expect(next.players[1].cards).toEqual([{ id: 'c3', role: 'thief', status: 'revealed' }]);
    expect(next.deck.at(-1)).toEqual({ id: 'c4', role: 'helper', status: 'alive' });
    expect(next.winnerId).toBeNull();
  });

  it('punishes a bluffing actor when challenged', () => {
    const state = riggedState();
    state.players[0].cards = [
      { id: 'c1', role: 'thief', status: 'alive' },
      { id: 'c2', role: 'helper', status: 'alive' },
    ];

    const next = resolveChallenge(state, {
      actorId: 'player-1',
      challengerId: 'player-2',
      claimedRole: 'leader',
    });

    expect(next.players[0].cards.filter((card) => card.status === 'revealed')).toHaveLength(1);
    expect(next.players[1].cards.filter((card) => card.status === 'revealed')).toHaveLength(0);
  });

  it('punishes a wrong challenger and replaces the proven card from the deck', () => {
    const next = resolveChallenge(riggedState(), {
      actorId: 'player-1',
      challengerId: 'player-2',
      claimedRole: 'leader',
    });

    expect(next.players[1].cards.filter((card) => card.status === 'revealed')).toHaveLength(1);
    expect(next.players[0].cards.some((card) => card.id === 'd1')).toBe(true);
  });

  it('can apply Minister attack after a failed challenge for one revealed and one hidden target loss', () => {
    const afterChallenge = resolveChallenge(riggedState(), {
      actorId: 'player-1',
      challengerId: 'player-2',
      claimedRole: 'officer',
    });
    const afterAttack = resolveAction(afterChallenge, {
      type: 'attack',
      actorId: 'player-1',
      targetId: 'player-2',
    });

    expect(afterAttack.players[1].cards.filter((card) => card.status === 'revealed')).toHaveLength(1);
    expect(afterAttack.deck.at(-1)).toEqual({ id: 'c4', role: 'helper', status: 'alive' });
  });

  it('does not resolve actions for eliminated players or completed games', () => {
    const completed = riggedState();
    completed.phase = 'complete';
    completed.players[0].money = 1;
    const afterComplete = resolveAction(completed, { type: 'income', actorId: 'player-1' });

    const eliminated = riggedState();
    eliminated.players[0].cards.forEach((card) => {
      card.status = 'revealed';
    });
    eliminated.players[0].money = 1;
    const afterEliminated = resolveAction(eliminated, { type: 'income', actorId: 'player-1' });

    expect(afterComplete.players[0].money).toBe(1);
    expect(afterEliminated.players[0].money).toBe(1);
  });

  it('handles income, fund raise, and exchange actions', () => {
    const state = riggedState();
    state.players[0].money = 2;

    const afterIncome = resolveAction(state, { type: 'income', actorId: 'player-1' });
    const afterFundRaise = resolveAction(state, { type: 'fundRaise', actorId: 'player-1' });
    const afterExchange = resolveAction(state, { type: 'exchange', actorId: 'player-1' });

    expect(afterIncome.players[0].money).toBe(3);
    expect(afterFundRaise.players[0].money).toBe(4);
    expect(afterExchange.players[0].cards).toHaveLength(2);
    expect(afterExchange.pendingChoice?.kind).toBe('exchangeKeep');
    expect(afterExchange.deck.length).toBe(1);
  });

  it('declares a winner when only one player has live cards', () => {
    const state = riggedState();
    state.players.slice(2).forEach((player) => {
      player.cards.forEach((card) => {
        card.status = 'revealed';
      });
    });
    state.players[1].cards[0].status = 'revealed';

    const next = resolveAction(state, {
      type: 'eliminate',
      actorId: 'player-1',
      targetId: 'player-2',
    });

    expect(next.winnerId).toBe('player-1');
    expect(next.phase).toBe('complete');
  });

  it('keeps the proven card if there is no replacement card in the deck', () => {
    const state = riggedState();
    state.deck = [];
    const next = resolveChallenge(state, {
      actorId: 'player-1',
      challengerId: 'player-2',
      claimedRole: 'leader',
    });

    expect(next.players[0].cards.some((card) => card.id === 'c1')).toBe(true);
    expect(next.players[1].cards.filter((card) => card.status === 'revealed')).toHaveLength(1);
  });

  it('pauses for a human card choice when losing a challenge with two live cards', () => {
    const state = riggedState();
    state.players[0].cards = [
      { id: 'c1', role: 'thief', status: 'alive' },
      { id: 'c2', role: 'helper', status: 'alive' },
    ];

    const next = resolveAction(state, {
      type: 'challenge',
      actorId: 'player-1',
      challengerId: 'player-2',
      claimedRole: 'leader',
      originalAction: { type: 'tax', actorId: 'player-1' },
    });

    expect(next.pendingChoice).toMatchObject({
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
    });
    expect(next.players[0].cards.filter((card) => card.status === 'revealed')).toHaveLength(0);
  });

  it('returns a selected human attack-loss card to the deck without revealing it', () => {
    const pending = resolveAction(riggedState(), {
      type: 'attack',
      actorId: 'player-2',
      targetId: 'player-1',
    });

    expect(pending.pendingChoice).toMatchObject({
      kind: 'revealCard',
      mode: 'returnToDeck',
      source: {
        actorId: 'player-2',
        actionType: 'attack',
        claimedRole: 'officer',
      },
    });

    const next = resolveAction(pending, {
      type: 'chooseRevealCard',
      playerId: 'player-1',
      cardId: 'c2',
    });

    expect(next.pendingChoice).toBeNull();
    expect(next.players[0].cards.find((card) => card.id === 'c2')).toBeUndefined();
    expect(next.players[0].cards.find((card) => card.id === 'c1')?.status).toBe('alive');
    expect(next.deck.at(-1)).toEqual({ id: 'c2', role: 'officer', status: 'alive' });
  });

  it('reveals the selected human challenge-loss card publicly', () => {
    const state = riggedState();
    state.players[0].cards = [
      { id: 'c1', role: 'thief', status: 'alive' },
      { id: 'c2', role: 'helper', status: 'alive' },
    ];
    const pending = resolveAction(state, {
      type: 'challenge',
      actorId: 'player-1',
      challengerId: 'player-2',
      claimedRole: 'leader',
      originalAction: { type: 'tax', actorId: 'player-1' },
    });
    const next = resolveAction(pending, {
      type: 'chooseRevealCard',
      playerId: 'player-1',
      cardId: 'c2',
    });

    expect(next.pendingChoice).toBeNull();
    expect(next.players[0].cards.find((card) => card.id === 'c2')?.status).toBe('revealed');
    expect(next.deck.some((card) => card.id === 'c2')).toBe(false);
  });

  it('auto-returns attack loss cards for a human with one live card and for bots', () => {
    const oneCardHuman = riggedState();
    oneCardHuman.players[0].cards[0].status = 'revealed';
    const afterHumanAttack = resolveAction(oneCardHuman, {
      type: 'attack',
      actorId: 'player-2',
      targetId: 'player-1',
    });

    const afterBotAttack = resolveAction(riggedState(), {
      type: 'attack',
      actorId: 'player-1',
      targetId: 'player-2',
    });

    expect(afterHumanAttack.pendingChoice).toBeNull();
    expect(afterHumanAttack.players[0].cards).toEqual([{ id: 'c1', role: 'leader', status: 'revealed' }]);
    expect(afterHumanAttack.deck.at(-1)).toEqual({ id: 'c2', role: 'officer', status: 'alive' });
    expect(afterBotAttack.pendingChoice).toBeNull();
    expect(afterBotAttack.players[1].cards).toHaveLength(1);
    expect(afterBotAttack.players[1].cards.filter((card) => card.status === 'revealed')).toHaveLength(0);
    expect(afterBotAttack.deck.at(-1)).toEqual({ id: 'c3', role: 'thief', status: 'alive' });
  });

  it('pauses human exchange and keeps the hand unchanged until cards are chosen', () => {
    const next = resolveAction(riggedState(), { type: 'exchange', actorId: 'player-1' });

    expect(next.pendingChoice).toMatchObject({
      kind: 'exchangeKeep',
      playerId: 'player-1',
      offered: [
        { id: 'd1', role: 'leader', status: 'alive' },
        { id: 'd2', role: 'officer', status: 'alive' },
      ],
    });
    expect(next.players[0].cards.map((card) => card.id)).toEqual(['c1', 'c2']);
    expect(next.deck.map((card) => card.id)).toEqual(['d3']);
  });

  it('applies a human exchange selection and returns unkept cards to the deck', () => {
    const pending = resolveAction(riggedState(), { type: 'exchange', actorId: 'player-1' });
    const next = resolveAction(pending, {
      type: 'chooseExchangeKeep',
      playerId: 'player-1',
      keepCardIds: ['c1', 'd1'],
    });

    expect(next.pendingChoice).toBeNull();
    expect(next.players[0].cards.map((card) => card.id)).toEqual(['c1', 'd1']);
    expect(next.deck.map((card) => card.id)).toEqual(['d3', 'c2', 'd2']);
    expect(next.log.at(-1)?.messageKey).toBe('action.exchange');
    expect(next.currentPlayerId).toBe('player-2');
  });

  it('ignores invalid exchange selections', () => {
    const pending = resolveAction(riggedState(), { type: 'exchange', actorId: 'player-1' });
    const next = resolveAction(pending, {
      type: 'chooseExchangeKeep',
      playerId: 'player-1',
      keepCardIds: ['c1', 'unknown'],
    });

    expect(next).toEqual(pending);
  });
});
