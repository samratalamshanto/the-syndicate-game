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
  turnCount: 0,
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

  it('seats the first humanCount players as humans for pass & play', () => {
    const game = createGame({ ...config, playerCount: 4, humanCount: 3 }, () => 0.1);
    const kinds = game.players.map((player) => player.kind);

    expect(kinds).toEqual(['human', 'human', 'human', 'bot']);
    expect(game.players[0].name).toBe('You');
    expect(game.players[1].name).toBe('Player 2');
    expect(game.currentPlayerId).toBe('player-1');
  });

  it('defaults to a single human when humanCount is omitted', () => {
    const game = createGame(config, () => 0.1);
    expect(game.players.filter((player) => player.kind === 'human')).toHaveLength(1);
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
    }, () => 1);

    expect(next.players[0].money).toBe(2);
    expect(next.players[1].cards).toEqual([{ id: 'c3', role: 'thief', status: 'revealed' }]);
    expect(next.deck.at(-1)).toEqual({ id: 'c4', role: 'helper', status: 'alive' });
    expect(next.winnerId).toBeNull();
  });

  it('ignores a primary action from a player who is not on turn', () => {
    const state = riggedState(); // current player is player-1
    const next = resolveAction(state, { type: 'tax', actorId: 'player-2' });

    expect(next.players[1].money).toBe(0); // no free +3 for an off-turn actor
    expect(next.currentPlayerId).toBe('player-1');
  });

  it('rejects an attack the actor cannot afford instead of performing it for free', () => {
    const state = riggedState();
    state.players[0].money = 2; // below the attack cost of 3
    const next = resolveAction(state, { type: 'attack', actorId: 'player-1', targetId: 'player-2' });

    expect(next.players[0].money).toBe(2); // not spent or clamped to zero
    expect(next.pendingChoice).toBeNull(); // target was never forced to reveal
    expect(next.players[1].cards.filter((card) => card.status === 'alive')).toHaveLength(2);
  });

  it('rejects an eliminate the actor cannot afford', () => {
    const state = riggedState();
    state.players[0].money = 6; // below the eliminate cost of 7
    const next = resolveAction(state, { type: 'eliminate', actorId: 'player-1', targetId: 'player-2' });

    expect(next.players[0].money).toBe(6);
    expect(next.pendingChoice).toBeNull();
    expect(next.players[1].cards.filter((card) => card.status === 'alive')).toHaveLength(2);
  });

  it('rejects a challenge whose claimed role does not match the action', () => {
    const state = riggedState(); // player-1 holds leader + officer
    const next = resolveAction(state, {
      type: 'challenge',
      actorId: 'player-1',
      challengerId: 'player-2',
      claimedRole: 'leader', // attack requires officer, not leader
      originalAction: { type: 'attack', actorId: 'player-1', targetId: 'player-3' },
    });

    expect(next.pendingChoice).toBeNull();
    expect(next.players[1].cards.filter((card) => card.status === 'revealed')).toHaveLength(0);
    expect(next.players[2].cards.filter((card) => card.status === 'alive')).toHaveLength(2);
  });

  it('rejects a block with an illegal blocking role for the action', () => {
    const state = riggedState();
    const next = resolveAction(state, {
      type: 'block',
      actorId: 'player-1',
      blockerId: 'player-2',
      blockingRole: 'reporter', // reporter blocks attack, not tax (tax is unblockable)
      originalAction: { type: 'tax', actorId: 'player-1' },
    });

    expect(next.pendingChoice).toBeNull();
  });

  it('rejects a challenge that wraps an off-turn action', () => {
    const state = riggedState(); // current player is player-1
    const next = resolveAction(state, {
      type: 'challenge',
      actorId: 'player-2',
      challengerId: 'player-3',
      claimedRole: 'leader',
      originalAction: { type: 'tax', actorId: 'player-2' }, // player-2 is not on turn
    });

    expect(next.pendingChoice).toBeNull();
    expect(next.players[1].cards.filter((card) => card.status === 'revealed')).toHaveLength(0);
  });

  it('rejects a steal that targets the actor themselves', () => {
    const state = riggedState();
    const next = resolveAction(state, { type: 'steal', actorId: 'player-1', targetId: 'player-1' });

    expect(next.players[0].money).toBe(9); // unchanged — no self-steal
    expect(next.pendingChoice).toBeNull();
  });

  it('rejects an attack on an already-eliminated target', () => {
    const state = riggedState();
    state.players[1].cards.forEach((card) => {
      card.status = 'revealed';
    }); // player-2 is out
    const next = resolveAction(state, { type: 'attack', actorId: 'player-1', targetId: 'player-2' });

    expect(next.players[0].money).toBe(9); // attack cost not spent
    expect(next.pendingChoice).toBeNull();
  });

  it('rejects a targeted action against a non-existent player', () => {
    const state = riggedState();
    const next = resolveAction(state, { type: 'eliminate', actorId: 'player-1', targetId: 'nobody' });

    expect(next.players[0].money).toBe(9);
    expect(next.pendingChoice).toBeNull();
  });

  it('does not punish the attacker when their truthful Minister attack is challenged', () => {
    // player-1 holds officer (Minister, c2); a wrong challenge must cost the challenger, not the attacker.
    const state = riggedState();
    const next = resolveAction(
      state,
      {
        type: 'challenge',
        actorId: 'player-1',
        challengerId: 'player-2',
        claimedRole: 'officer',
        originalAction: { type: 'attack', actorId: 'player-1', targetId: 'player-3' },
      },
      () => 0,
    );

    // Attacker proved the role: the challenger lost a card and the attacker is picking a
    // replacement (proven card briefly removed) — crucially, the attacker is NOT eliminated.
    expect(next.players[1].cards.filter((c) => c.status === 'revealed')).toHaveLength(1);
    expect(next.pendingChoice?.kind).toBe('replaceProvenCard');
    expect(next.players[0].cards.filter((c) => c.status === 'alive').length).toBeGreaterThan(0);
  });

  it('punishes the bluffing attacker when challenged (why an attack can get you out)', () => {
    // player-1 does NOT hold officer here, so a Minister attack is a bluff.
    const state = riggedState();
    state.players[0].cards = [
      { id: 'c1', role: 'leader', status: 'alive' },
      { id: 'c2', role: 'thief', status: 'revealed' }, // only one live card, and it's not officer
    ];
    const next = resolveAction(
      state,
      {
        type: 'challenge',
        actorId: 'player-1',
        challengerId: 'player-2',
        claimedRole: 'officer',
        originalAction: { type: 'attack', actorId: 'player-1', targetId: 'player-3' },
      },
      () => 0,
    );

    // The bluffing attacker loses their last live card and is eliminated — expected, not a bug.
    expect(next.players[0].cards.filter((c) => c.status === 'alive')).toHaveLength(0);
  });

  it('rejects a challenge from the actor against themselves', () => {
    const state = riggedState();
    const next = resolveAction(state, {
      type: 'challenge',
      actorId: 'player-1',
      challengerId: 'player-1', // cannot challenge your own claim
      claimedRole: 'officer',
      originalAction: { type: 'attack', actorId: 'player-1', targetId: 'player-3' },
    });

    expect(next.pendingChoice).toBeNull();
    expect(next.players[2].cards.filter((card) => card.status === 'alive')).toHaveLength(2);
  });

  it('rejects a challenge from an eliminated challenger', () => {
    const state = riggedState();
    state.players[1].cards.forEach((card) => {
      card.status = 'revealed';
    }); // player-2 is out
    const next = resolveAction(state, {
      type: 'challenge',
      actorId: 'player-1',
      challengerId: 'player-2',
      claimedRole: 'officer',
      originalAction: { type: 'attack', actorId: 'player-1', targetId: 'player-3' },
    });

    expect(next.pendingChoice).toBeNull();
  });

  it('rejects a block from the actor against themselves', () => {
    const state = riggedState();
    const next = resolveAction(state, {
      type: 'block',
      actorId: 'player-1',
      blockerId: 'player-1', // cannot block your own action
      blockingRole: 'leader',
      originalAction: { type: 'fundRaise', actorId: 'player-1' },
    });

    expect(next.pendingChoice).toBeNull();
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

  it('pauses for a human replacement choice after proving a challenged role', () => {
    const next = resolveAction(
      riggedState(),
      {
        type: 'challenge',
        actorId: 'player-1',
        challengerId: 'player-2',
        claimedRole: 'leader',
        originalAction: { type: 'tax', actorId: 'player-1' },
      },
      () => 0,
    );

    expect(next.pendingChoice?.kind).toBe('replaceProvenCard');
    const pending = next.pendingChoice as Extract<typeof next.pendingChoice, { kind: 'replaceProvenCard' }>;
    // One card of every distinct role in the deck — including the returned 'leader'.
    expect([...pending.offered.map((card) => card.role)].sort()).toEqual(['leader', 'officer', 'reporter']);
    expect(pending.followUp).toEqual({ type: 'tax', actorId: 'player-1' });

    const officerCard = pending.offered.find((card) => card.role === 'officer')!;
    const afterChoice = resolveAction(
      next,
      { type: 'chooseReplacementCard', playerId: 'player-1', cardId: officerCard.id },
      () => 0,
    );

    expect(afterChoice.pendingChoice).toBeNull();
    expect(afterChoice.players[0].cards.some((card) => card.role === 'officer')).toBe(true);
    expect(afterChoice.players[0].money).toBe(10); // tax follow-up applied, capped at 10
    expect(afterChoice.currentPlayerId).toBe('player-2');
  });

  it('can apply Minister attack after a failed challenge for one revealed and one hidden target loss', () => {
    const afterChallenge = resolveChallenge(riggedState(), {
      actorId: 'player-1',
      challengerId: 'player-2',
      claimedRole: 'officer',
    }, () => 0);
    const afterAttack = resolveAction(afterChallenge, {
      type: 'attack',
      actorId: 'player-1',
      targetId: 'player-2',
    }, () => 1);

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

  it('pauses for an actor counter-challenge when a block is claimed', () => {
    const next = resolveAction(riggedState(), {
      type: 'block',
      actorId: 'player-1',
      blockerId: 'player-3',
      blockingRole: 'leader',
      originalAction: { type: 'fundRaise', actorId: 'player-1' },
    });

    expect(next.pendingChoice).toMatchObject({
      kind: 'counterChallenge',
      playerId: 'player-1',
      blockerId: 'player-3',
      blockingRole: 'leader',
    });
    expect(next.currentPlayerId).toBe('player-1');
  });

  it('lets the actor pass on a counter-challenge so the block succeeds', () => {
    const pending = resolveAction(riggedState(), {
      type: 'block',
      actorId: 'player-1',
      blockerId: 'player-3',
      blockingRole: 'leader',
      originalAction: { type: 'fundRaise', actorId: 'player-1' },
    });
    const next = resolveAction(pending, {
      type: 'chooseCounterChallenge',
      playerId: 'player-1',
      challenge: false,
    });

    expect(next.pendingChoice).toBeNull();
    expect(next.players[0].money).toBe(9);
    expect(next.log.at(-1)?.messageKey).toBe('block.success');
  });

  it('continues the original action when a false block is counter-challenged', () => {
    const pending = resolveAction(riggedState(), {
      type: 'block',
      actorId: 'player-1',
      blockerId: 'player-2',
      blockingRole: 'leader',
      originalAction: { type: 'fundRaise', actorId: 'player-1' },
    });
    const next = resolveAction(pending, {
      type: 'chooseCounterChallenge',
      playerId: 'player-1',
      challenge: true,
    });

    expect(next.pendingChoice).toBeNull();
    expect(next.players[1].cards.filter((card) => card.status === 'revealed')).toHaveLength(1);
    expect(next.players[0].money).toBe(10);
    expect(next.log.at(-2)?.messageKey).toBe('challenge.actorLost');
    expect(next.log.at(-1)?.messageKey).toBe('action.fundRaise');
  });

  it('punishes the actor when a true block is counter-challenged', () => {
    const pending = resolveAction(riggedState(), {
      type: 'block',
      actorId: 'player-1',
      blockerId: 'player-3',
      blockingRole: 'leader',
      originalAction: { type: 'fundRaise', actorId: 'player-1' },
    });
    const next = resolveAction(pending, {
      type: 'chooseCounterChallenge',
      playerId: 'player-1',
      challenge: true,
    });

    expect(next.pendingChoice).toBeNull();
    expect(next.players[0].cards.filter((card) => card.status === 'revealed')).toHaveLength(1);
    expect(next.players[0].money).toBe(9);
    expect(next.log.at(-1)?.messageKey).toBe('challenge.challengerLost');
  });

  it('pauses for a block-lost reveal choice with the claimed blocking role', () => {
    const state = riggedState();
    state.currentPlayerId = 'player-2'; // the attacker must be on turn
    state.players[1].money = 3; // and able to pay the attack cost
    const pending = resolveAction(state, {
      type: 'block',
      actorId: 'player-2',
      blockerId: 'player-1',
      blockingRole: 'reporter',
      originalAction: { type: 'attack', actorId: 'player-2', targetId: 'player-1' },
    });
    const next = resolveAction(pending, {
      type: 'chooseCounterChallenge',
      playerId: 'player-2',
      challenge: true,
    });

    expect(next.pendingChoice).toMatchObject({
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
    });
    expect(next.log.at(-1)?.messageKey).toBe('challenge.actorLost');
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
    const state = riggedState();
    state.currentPlayerId = 'player-2'; // attacker must be on turn
    state.players[1].money = 3; // and able to pay the attack cost
    const pending = resolveAction(state, {
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
    }, () => 1);

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
    oneCardHuman.currentPlayerId = 'player-2'; // attacker must be on turn
    oneCardHuman.players[1].money = 3; // and able to pay the attack cost
    oneCardHuman.players[0].cards[0].status = 'revealed';
    const afterHumanAttack = resolveAction(oneCardHuman, {
      type: 'attack',
      actorId: 'player-2',
      targetId: 'player-1',
    }, () => 1);

    let randomIndex = 0;
    const pickFirstThenAppend = () => (randomIndex++ === 0 ? 0 : 1);
    const afterBotAttack = resolveAction(riggedState(), {
      type: 'attack',
      actorId: 'player-1',
      targetId: 'player-2',
    }, pickFirstThenAppend);

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
    }, () => 1);

    expect(next.pendingChoice).toBeNull();
    expect(next.players[0].cards.map((card) => card.id)).toEqual(['c1', 'd1']);
    expect(next.deck.map((card) => card.id)).toEqual(['d3', 'c2', 'd2']);
    expect(next.log.at(-1)?.messageKey).toBe('action.exchange');
    expect(next.currentPlayerId).toBe('player-2');
  });

  it('can append returned cards with random 1 for the old deck-order contract', () => {
    const next = resolveChallenge(riggedState(), {
      actorId: 'player-1',
      challengerId: 'player-2',
      claimedRole: 'leader',
    }, () => 1);

    expect(next.deck.at(-1)).toEqual({ id: 'c1', role: 'leader', status: 'alive' });
  });

  it('does not keep proven returned cards predictably at the bottom of a larger deck', () => {
    const bottomReturns = Array.from({ length: 200 }).filter((_, index) => {
      const state = riggedState();
      state.deck = Array.from({ length: 12 }, (__, deckIndex) => ({
        id: `d${deckIndex + 1}`,
        role: 'reporter' as const,
        status: 'alive' as const,
      }));
      const random = () => (index % 200) / 200;
      const next = resolveChallenge(state, {
        actorId: 'player-1',
        challengerId: 'player-2',
        claimedRole: 'leader',
      }, random);

      return next.deck.at(-1)?.id === 'c1';
    }).length;

    expect(bottomReturns).toBeLessThan(60);
  });

  it('picks forced bot challenge reveals from both live card slots', () => {
    const counts = { thief: 0, helper: 0 };

    for (let index = 0; index < 200; index += 1) {
      const state = riggedState();
      state.currentPlayerId = 'player-2';
      const next = resolveChallenge(state, {
        actorId: 'player-2',
        challengerId: 'player-1',
        claimedRole: 'leader',
      }, () => (index % 2 === 0 ? 0 : 0.99));
      const revealed = next.players[1].cards.find((card) => card.status === 'revealed');
      if (revealed?.role === 'thief' || revealed?.role === 'helper') {
        counts[revealed.role] += 1;
      }
    }

    expect(counts.thief).toBeGreaterThan(60);
    expect(counts.helper).toBeGreaterThan(60);
  });

  it('picks the first auto-return card with random 0 for the old slot contract', () => {
    let randomIndex = 0;
    const next = resolveAction(riggedState(), {
      type: 'attack',
      actorId: 'player-1',
      targetId: 'player-2',
    }, () => (randomIndex++ === 0 ? 0 : 1));

    expect(next.deck.at(-1)).toEqual({ id: 'c3', role: 'thief', status: 'alive' });
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

  it('tracks completed turns independently from log length', () => {
    let state = riggedState();

    for (let index = 0; index < 8; index += 1) {
      state = resolveAction(state, { type: 'income', actorId: state.currentPlayerId });
    }

    expect(state.turnCount).toBe(8);
    expect(Math.floor(state.turnCount / state.players.length) + 1).toBe(3);
  });

  it('counts a challenge-heavy turn once after the reveal choice resolves', () => {
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
    const next = resolveAction(pending, { type: 'chooseRevealCard', playerId: 'player-1', cardId: 'c1' });

    expect(pending.turnCount).toBe(0);
    expect(next.turnCount).toBe(1);
    expect(next.currentPlayerId).toBe('player-2');
  });
});
