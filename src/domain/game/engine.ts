import type {
  Challenge,
  CharacterCard,
  GameAction,
  GameConfig,
  GameLogEntry,
  GameState,
  Player,
  PlayerView,
  PrimaryGameAction,
  RoleId,
} from './types';
import { seededRandom } from './random';

type RandomSource = () => number;

const actionRoles: Partial<Record<GameAction['type'], RoleId>> = {
  tax: 'leader',
  attack: 'officer',
  steal: 'thief',
  exchange: 'helper',
};

const primaryActionCost: Partial<Record<GameAction['type'], number>> = {
  attack: 3,
  eliminate: 7,
};

// Which claimed role may block which action.
const blockingRoles: Partial<Record<GameAction['type'], RoleId>> = {
  fundRaise: 'leader',
  steal: 'helper',
  attack: 'reporter',
};

export const requiredRoleForAction = (actionType: GameAction['type']) => actionRoles[actionType] ?? null;

// A primary action may run only from the on-turn, non-eliminated actor who can pay its
// cost, and (for targeted actions) against a different, still-alive player.
const canPlayPrimary = (state: GameState, action: PrimaryGameAction): boolean => {
  if (action.actorId !== state.currentPlayerId) return false;
  const actor = state.players.find((player) => player.id === action.actorId);
  if (!actor || isEliminated(actor)) return false;
  if (actor.money < (primaryActionCost[action.type] ?? 0)) return false;
  if ('targetId' in action) {
    if (action.targetId === action.actorId) return false;
    const target = state.players.find((player) => player.id === action.targetId);
    if (!target || isEliminated(target)) return false;
  }
  return true;
};

// A challenge/block reactor must be a different, still-alive player from the actor.
const canReact = (state: GameState, actorId: string, reactorId: string): boolean => {
  if (reactorId === actorId) return false;
  const reactor = state.players.find((player) => player.id === reactorId);
  return reactor !== undefined && !isEliminated(reactor);
};

export const createGame = (config: GameConfig, random: RandomSource = config.seed ? seededRandom(config.seed) : Math.random): GameState => {
  const deck = shuffle(createDeck(config), random);
  const humanCount = Math.max(1, config.humanCount ?? 1);
  const players: Player[] = Array.from({ length: config.playerCount }, (_, index) => {
    const id = `player-${index + 1}`;
    const isHuman = index < humanCount;
    const cards = deck.splice(0, config.cardsPerPlayer);
    return {
      id,
      name: isHuman ? (index === 0 ? 'You' : `Player ${index + 1}`) : `Bot ${index}`,
      kind: isHuman ? 'human' : 'bot',
      money: config.startingMoney,
      cards,
    };
  });

  return {
    id: `game-${Date.now()}`,
    config,
    currentPlayerId: config.humanPlayerId,
    phase: 'action',
    winnerId: null,
    players,
    deck,
    log: [log('gameStarted')],
    turnCount: 0,
    botMemory: {},
    pendingChoice: null,
  };
};

export const getPlayerView = (state: GameState, viewerId: string): PlayerView => ({
  viewerId,
  currentPlayerId: state.currentPlayerId,
  phase: state.phase,
  winnerId: state.winnerId,
  log: state.log,
  players: state.players.map((player) => {
    const isViewer = player.id === viewerId;
    return {
      id: player.id,
      name: player.name,
      kind: player.kind,
      money: isViewer ? player.money : null,
      aliveCards: liveCards(player).length,
      revealedRoles: player.cards.filter((card) => card.status === 'revealed').map((card) => card.role),
      isEliminated: isEliminated(player),
      cards: isViewer ? player.cards : null,
      personaId: player.personaId,
    };
  }),
});

export const resolveAction = (state: GameState, action: GameAction, random: RandomSource = Math.random): GameState => {
  const next = cloneState(state);
  if (action.type === 'chooseRevealCard') {
    const turnOwnerId = next.currentPlayerId;
    applyRevealChoice(next, action, random);
    settleAfterAction(next);
    if (next.phase !== 'complete' && state.pendingChoice !== null && next.pendingChoice === null) {
      advanceTurn(next, turnOwnerId);
    }
    return next;
  }
  if (action.type === 'chooseExchangeKeep') {
    const turnOwnerId = next.currentPlayerId;
    applyExchangeChoice(next, action, random);
    settleAfterAction(next);
    if (next.phase !== 'complete' && state.pendingChoice !== null && next.pendingChoice === null) {
      advanceTurn(next, turnOwnerId);
    }
    return next;
  }
  if (action.type === 'chooseReplacementCard') {
    const turnOwnerId = next.currentPlayerId;
    applyReplacementChoice(next, action, random);
    settleAfterAction(next);
    if (next.phase !== 'complete' && state.pendingChoice !== null && next.pendingChoice === null) {
      advanceTurn(next, turnOwnerId);
    }
    return next;
  }
  if (action.type === 'chooseCounterChallenge') {
    const turnOwnerId = next.currentPlayerId;
    applyCounterChallengeChoice(next, action, random);
    settleAfterAction(next);
    if (next.phase !== 'complete' && state.pendingChoice !== null && next.pendingChoice === null) {
      advanceTurn(next, turnOwnerId);
    }
    return next;
  }

  const actor = findPlayer(next, action.actorId);

  if (isEliminated(actor) || next.phase === 'complete') {
    return next;
  }

  // A primary action is legitimate only from the on-turn, non-eliminated actor who can
  // pay its cost. Challenge/block reactions are validated against the action they wrap,
  // so a malformed reaction can never resolve its originalAction off-turn or for free.
  if (action.type === 'challenge') {
    const original = action.originalAction;
    if (
      action.claimedRole !== requiredRoleForAction(original.type) ||
      !canReact(next, action.actorId, action.challengerId) ||
      !canPlayPrimary(next, original)
    ) {
      return next;
    }
    applyChallengeAction(next, action, random);
  } else if (action.type === 'block') {
    const original = action.originalAction;
    if (
      blockingRoles[original.type] !== action.blockingRole ||
      !canReact(next, action.actorId, action.blockerId) ||
      !canPlayPrimary(next, original)
    ) {
      return next;
    }
    const blocker = findPlayer(next, action.blockerId);
    const originalActor = findPlayer(next, original.actorId);
    next.pendingChoice = {
      kind: 'counterChallenge',
      playerId: originalActor.id,
      blockerId: blocker.id,
      blockingRole: action.blockingRole,
      originalAction: original,
    };
  } else {
    if (!canPlayPrimary(next, action)) {
      return next;
    }
    applyPrimaryAction(next, action, random);
  }

  settleAfterAction(next);
  if (!next.winnerId && next.pendingChoice === null) {
    advanceTurn(next, actor.id);
  }
  return next;
};

const applyPrimaryAction = (state: GameState, action: PrimaryGameAction, random: RandomSource) => {
  const actor = findPlayer(state, action.actorId);
  switch (action.type) {
    case 'income':
      actor.money = addMoney(actor.money, 1, state.config.maxMoney);
      state.log.push(log('action.income', { actor: actor.name, amount: 1 }));
      break;
    case 'fundRaise':
      actor.money = addMoney(actor.money, 2, state.config.maxMoney);
      state.log.push(log('action.fundRaise', { actor: actor.name, amount: 2 }));
      break;
    case 'tax':
      actor.money = addMoney(actor.money, 3, state.config.maxMoney);
      state.log.push(log('action.tax', { actor: actor.name, amount: 3 }));
      break;
    case 'steal':
      applySteal(state, actor, action.targetId);
      break;
    case 'exchange':
      applyExchange(state, actor, random);
      break;
    case 'attack':
      spend(actor, 3);
      if (requestRevealCard(state, findPlayer(state, action.targetId), 'attack', 'returnToDeck', null, {
        actorId: actor.id,
        actionType: action.type,
        claimedRole: requiredRoleForAction(action.type) ?? undefined,
      }, random)) {
        return;
      }
      state.log.push(log('action.attack', { actor: actor.name, target: findPlayer(state, action.targetId).name }));
      break;
    case 'eliminate':
      spend(actor, 7);
      if (requestRevealCard(state, findPlayer(state, action.targetId), 'eliminate', 'returnToDeck', null, {
        actorId: actor.id,
        actionType: action.type,
      }, random)) {
        return;
      }
      state.log.push(log('action.eliminate', { actor: actor.name, target: findPlayer(state, action.targetId).name }));
      break;
  }
};

const applyChallengeAction = (state: GameState, action: Extract<GameAction, { type: 'challenge' }>, random: RandomSource) => {
  const actor = findPlayer(state, action.actorId);
  const challenger = findPlayer(state, action.challengerId);
  const provenCard = liveCards(actor).find((card) => card.role === action.claimedRole);

  if (!provenCard) {
    if (requestRevealCard(state, actor, 'challenge_lost', 'reveal', null, {
      actorId: challenger.id,
      actionType: 'challenge',
      claimedRole: action.claimedRole,
    }, random)) {
      return;
    }
    state.log.push(log('challenge.actorLost', { actor: actor.name, challenger: challenger.name, role: action.claimedRole }));
    return;
  }

  if (requestRevealCard(state, challenger, 'challenge_lost', 'reveal', action.originalAction, {
    actorId: actor.id,
    actionType: 'challenge',
    claimedRole: action.claimedRole,
  }, random)) {
    return;
  }
  state.log.push(log('challenge.challengerLost', { actor: actor.name, challenger: challenger.name, role: action.claimedRole }));

  if (!isEliminated(challenger)) {
    if (requestReplacementCard(state, actor, provenCard, action.originalAction, random)) {
      return;
    }
    replaceProvenCard(state, actor, provenCard, random);
    applyPrimaryAction(state, action.originalAction, random);
    return;
  }
  if (requestReplacementCard(state, actor, provenCard, null, random)) {
    return;
  }
  replaceProvenCard(state, actor, provenCard, random);
};

export const resolveChallenge = (state: GameState, challenge: Challenge, random: RandomSource = Math.random): GameState => {
  const next = cloneState(state);
  const actor = findPlayer(next, challenge.actorId);
  const challenger = findPlayer(next, challenge.challengerId);
  const provenCard = liveCards(actor).find((card) => card.role === challenge.claimedRole);

  if (!provenCard) {
    revealOneCard(actor, random);
    next.log.push(log('challenge.actorLost', { actor: actor.name, challenger: challenger.name }));
  } else {
    revealOneCard(challenger, random);
    replaceProvenCard(next, actor, provenCard, random);
    next.log.push(log('challenge.challengerLost', { actor: actor.name, challenger: challenger.name }));
  }

  settleAfterAction(next);
  return next;
};

export const isEliminated = (player: Player) => liveCards(player).length === 0;

const createDeck = (config: GameConfig): CharacterCard[] =>
  Object.entries(config.roleCopies).flatMap(([role, count]) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${role}-${index + 1}`,
      role: role as RoleId,
      status: 'alive' as const,
    })),
  );

const shuffle = <T>(items: T[], random: RandomSource) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const insertRandom = (deck: CharacterCard[], card: CharacterCard, random: RandomSource) => {
  const index = Math.min(deck.length, Math.floor(random() * (deck.length + 1)));
  deck.splice(index, 0, card);
};

const insertAllRandom = (deck: CharacterCard[], cards: CharacterCard[], random: RandomSource) => {
  cards.forEach((card) => insertRandom(deck, card, random));
};

const addMoney = (money: number, amount: number, maxMoney: number) => Math.min(maxMoney, money + amount);

const spend = (player: Player, amount: number) => {
  player.money = Math.max(0, player.money - amount);
};

const applySteal = (state: GameState, actor: Player, targetId: string) => {
  const target = findPlayer(state, targetId);
  const amount = Math.min(2, target.money, state.config.maxMoney - actor.money);
  target.money -= amount;
  actor.money += amount;
  state.log.push(log('action.steal', { actor: actor.name, target: target.name, amount }));
};

const applyExchange = (state: GameState, actor: Player, random: RandomSource) => {
  const drawn = state.deck.splice(0, 2);
  const alive = liveCards(actor);
  if (actor.kind === 'human' && alive.length > 0) {
    state.pendingChoice = { kind: 'exchangeKeep', playerId: actor.id, offered: drawn };
    return;
  }
  const keep = [...alive, ...drawn].slice(0, alive.length);
  const returned = [...alive, ...drawn].slice(alive.length);
  actor.cards = [...actor.cards.filter((card) => card.status === 'revealed'), ...keep];
  insertAllRandom(state.deck, returned.map((card) => ({ ...card, status: 'alive' as const })), random);
  state.log.push(log('action.exchange', { actor: actor.name }));
};

const replaceProvenCard = (state: GameState, actor: Player, provenCard: CharacterCard, random: RandomSource) => {
  const replacement = state.deck.shift();
  if (!replacement) {
    return;
  }
  const cardIndex = actor.cards.findIndex((card) => card.id === provenCard.id);
  actor.cards[cardIndex] = replacement;
  insertRandom(state.deck, { ...provenCard, status: 'alive' }, random);
};

const requestReplacementCard = (
  state: GameState,
  actor: Player,
  provenCard: CharacterCard,
  followUp: PrimaryGameAction | null,
  random: RandomSource,
) => {
  if (actor.kind !== 'human' || state.deck.length === 0) {
    return false;
  }
  const cardIndex = actor.cards.findIndex((card) => card.id === provenCard.id && card.status === 'alive');
  if (cardIndex < 0) {
    return false;
  }
  actor.cards.splice(cardIndex, 1);
  // Return the proven card to the deck, then offer one card of every distinct role
  // currently in the deck (including cards returned from earlier attacks/eliminations),
  // so the winner genuinely chooses their new role instead of getting an auto-draw.
  insertRandom(state.deck, { ...provenCard, status: 'alive' }, random);
  const seenRoles = new Set<RoleId>();
  const offered: CharacterCard[] = [];
  for (const card of state.deck) {
    if (!seenRoles.has(card.role)) {
      seenRoles.add(card.role);
      offered.push(card);
    }
  }
  for (const card of offered) {
    const index = state.deck.findIndex((deckCard) => deckCard.id === card.id);
    if (index >= 0) {
      state.deck.splice(index, 1);
    }
  }
  state.pendingChoice = { kind: 'replaceProvenCard', playerId: actor.id, offered, followUp };
  return true;
};

const revealOneCard = (player: Player, random: RandomSource) => {
  const alive = liveCards(player);
  const card = alive[Math.min(alive.length - 1, Math.floor(random() * alive.length))];
  if (card) {
    card.status = 'revealed';
  }
};

const requestRevealCard = (
  state: GameState,
  player: Player,
  cause: Extract<NonNullable<GameState['pendingChoice']>, { kind: 'revealCard' }>['cause'],
  mode: Extract<NonNullable<GameState['pendingChoice']>, { kind: 'revealCard' }>['mode'],
  followUp: PrimaryGameAction | null,
  source: Extract<NonNullable<GameState['pendingChoice']>, { kind: 'revealCard' }>['source'],
  random: RandomSource,
) => {
  const alive = liveCards(player);
  if (player.kind === 'human' && alive.length > 1) {
    state.pendingChoice = { kind: 'revealCard', playerId: player.id, cause, mode, followUp, source };
    return true;
  }
  if (mode === 'returnToDeck') {
    const card = alive[Math.min(alive.length - 1, Math.floor(random() * alive.length))];
    returnCardToDeck(state, player, card?.id, random);
  } else {
    revealOneCard(player, random);
  }
  return false;
};

const applyRevealChoice = (
  state: GameState,
  action: Extract<GameAction, { type: 'chooseRevealCard' }>,
  random: RandomSource,
) => {
  const pending = state.pendingChoice;
  if (pending?.kind !== 'revealCard' || pending.playerId !== action.playerId) {
    return;
  }
  const player = findPlayer(state, action.playerId);
  const card = liveCards(player).find((candidate) => candidate.id === action.cardId);
  if (!card) {
    return;
  }
  if (pending.mode === 'returnToDeck') {
    returnCardToDeck(state, player, card.id, random);
  } else {
    card.status = 'revealed';
  }
  state.pendingChoice = null;
  if (pending.cause === 'block_lost') {
    if (pending.followUp && !isEliminated(player)) {
      applyPrimaryAction(state, pending.followUp, random);
    }
    return;
  }
  if (pending.followUp && !isEliminated(player)) {
    const actor = findPlayer(state, pending.followUp.actorId);
    const provenCard = liveCards(actor).find((candidate) => candidate.role === requiredRoleForAction(pending.followUp!.type));
    if (provenCard) {
      if (requestReplacementCard(state, actor, provenCard, pending.followUp, random)) {
        state.log.push(log('challenge.challengerLost', {
          actor: actor.name,
          challenger: player.name,
          role: requiredRoleForAction(pending.followUp.type) ?? '',
        }));
        return;
      }
      replaceProvenCard(state, actor, provenCard, random);
    }
    state.log.push(log('challenge.challengerLost', {
      actor: actor.name,
      challenger: player.name,
      role: requiredRoleForAction(pending.followUp.type) ?? '',
    }));
    applyPrimaryAction(state, pending.followUp, random);
    return;
  }
  const entry = revealLogEntry(state, pending.cause, player);
  if (entry) {
    state.log.push(entry);
  }
};

const applyReplacementChoice = (
  state: GameState,
  action: Extract<GameAction, { type: 'chooseReplacementCard' }>,
  random: RandomSource,
) => {
  const pending = state.pendingChoice;
  if (pending?.kind !== 'replaceProvenCard' || pending.playerId !== action.playerId) {
    return;
  }
  const player = findPlayer(state, action.playerId);
  const selected = pending.offered.find((card) => card.id === action.cardId);
  if (!selected) {
    return;
  }
  player.cards.push({ ...selected, status: 'alive' });
  insertAllRandom(state.deck, pending.offered.filter((card) => card.id !== selected.id).map((card) => ({ ...card, status: 'alive' as const })), random);
  state.pendingChoice = null;
  if (pending.followUp && !isEliminated(player)) {
    applyPrimaryAction(state, pending.followUp, random);
  }
};

const returnCardToDeck = (state: GameState, player: Player, cardId: string | undefined, random: RandomSource) => {
  if (!cardId) {
    return;
  }
  const cardIndex = player.cards.findIndex((card) => card.id === cardId && card.status === 'alive');
  if (cardIndex < 0) {
    return;
  }
  const [card] = player.cards.splice(cardIndex, 1);
  insertRandom(state.deck, { ...card, status: 'alive' }, random);
};

const applyExchangeChoice = (
  state: GameState,
  action: Extract<GameAction, { type: 'chooseExchangeKeep' }>,
  random: RandomSource,
) => {
  const pending = state.pendingChoice;
  if (pending?.kind !== 'exchangeKeep' || pending.playerId !== action.playerId) {
    return;
  }
  const player = findPlayer(state, action.playerId);
  const alive = liveCards(player);
  const candidates = [...alive, ...pending.offered];
  const keepIds = new Set(action.keepCardIds);
  if (keepIds.size !== alive.length || action.keepCardIds.some((id) => !candidates.some((card) => card.id === id))) {
    return;
  }

  const keep = candidates.filter((card) => keepIds.has(card.id)).map((card) => ({ ...card, status: 'alive' as const }));
  const returned = candidates.filter((card) => !keepIds.has(card.id)).map((card) => ({ ...card, status: 'alive' as const }));
  player.cards = [...player.cards.filter((card) => card.status === 'revealed'), ...keep];
  insertAllRandom(state.deck, returned, random);
  state.pendingChoice = null;
  state.log.push(log('action.exchange', { actor: player.name }));
};

const applyCounterChallengeChoice = (
  state: GameState,
  action: Extract<GameAction, { type: 'chooseCounterChallenge' }>,
  random: RandomSource,
) => {
  const pending = state.pendingChoice;
  if (pending?.kind !== 'counterChallenge' || pending.playerId !== action.playerId) {
    return;
  }

  const actor = findPlayer(state, pending.playerId);
  const blocker = findPlayer(state, pending.blockerId);
  state.pendingChoice = null;

  if (!action.challenge) {
    state.log.push(log('block.success', {
      actor: actor.name,
      blocker: blocker.name,
      role: pending.blockingRole,
    }));
    return;
  }

  const provenCard = liveCards(blocker).find((card) => card.role === pending.blockingRole);
  if (!provenCard) {
    state.log.push(log('challenge.actorLost', {
      actor: blocker.name,
      challenger: actor.name,
      role: pending.blockingRole,
    }));
    if (requestRevealCard(state, blocker, 'block_lost', 'reveal', pending.originalAction, {
      actorId: actor.id,
      actionType: 'challenge',
      claimedRole: pending.blockingRole,
    }, random)) {
      return;
    }
    if (!isEliminated(blocker)) {
      applyPrimaryAction(state, pending.originalAction, random);
    }
    return;
  }

  revealOneCard(actor, random);
  state.log.push(log('challenge.challengerLost', {
    actor: blocker.name,
    challenger: actor.name,
    role: pending.blockingRole,
  }));
  if (requestReplacementCard(state, blocker, provenCard, null, random)) {
    return;
  }
  replaceProvenCard(state, blocker, provenCard, random);
};

const revealLogEntry = (
  state: GameState,
  cause: Extract<NonNullable<GameState['pendingChoice']>, { kind: 'revealCard' }>['cause'],
  player: Player,
) => {
  const actor = findPlayer(state, state.currentPlayerId);
  if (cause === 'attack') {
    return log('action.attack', { actor: actor.name, target: player.name });
  }
  if (cause === 'eliminate') {
    return log('action.eliminate', { actor: actor.name, target: player.name });
  }
  if (cause === 'challenge_lost') {
    return log('challenge.actorLost', { actor: player.name, challenger: actor.name, role: '' });
  }
  return null;
};

const settleAfterAction = (state: GameState) => {
  if (state.pendingChoice !== null) {
    return;
  }
  state.winnerId = getWinnerId(state);
  state.phase = state.winnerId ? 'complete' : state.phase;
};

const liveCards = (player: Player) => player.cards.filter((card) => card.status === 'alive');

const findPlayer = (state: GameState, playerId: string) => {
  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player) {
    throw new Error(`Unknown player: ${playerId}`);
  }
  return player;
};

const getWinnerId = (state: GameState) => {
  const alivePlayers = state.players.filter((player) => !isEliminated(player));
  return alivePlayers.length === 1 ? alivePlayers[0].id : null;
};

const nextAlivePlayerId = (state: GameState, currentPlayerId: string) => {
  const currentIndex = state.players.findIndex((player) => player.id === currentPlayerId);
  for (let offset = 1; offset <= state.players.length; offset += 1) {
    const candidate = state.players[(currentIndex + offset) % state.players.length];
    if (!isEliminated(candidate)) {
      return candidate.id;
    }
  }
  return currentPlayerId;
};

const advanceTurn = (state: GameState, currentPlayerId: string) => {
  state.currentPlayerId = nextAlivePlayerId(state, currentPlayerId);
  state.turnCount += 1;
};

const cloneState = (state: GameState): GameState => ({
  ...state,
  config: { ...state.config, roleCopies: { ...state.config.roleCopies } },
  players: state.players.map((player) => ({
    ...player,
    cards: player.cards.map((card) => ({ ...card })),
  })),
  deck: state.deck.map((card) => ({ ...card })),
  log: state.log.map((entry) => ({ ...entry, values: entry.values ? { ...entry.values } : undefined })),
  botMemory: { ...state.botMemory },
  pendingChoice: clonePendingChoice(state.pendingChoice),
});

const clonePendingChoice = (pendingChoice: GameState['pendingChoice']): GameState['pendingChoice'] => {
  if (pendingChoice?.kind === 'exchangeKeep') {
    return {
      ...pendingChoice,
      offered: pendingChoice.offered.map((card) => ({ ...card })),
    };
  }
  if (pendingChoice?.kind === 'replaceProvenCard') {
    return {
      ...pendingChoice,
      offered: pendingChoice.offered.map((card) => ({ ...card })),
      followUp: pendingChoice.followUp ? { ...pendingChoice.followUp } : null,
    };
  }
  if (pendingChoice?.kind === 'revealCard') {
    return {
      ...pendingChoice,
      followUp: pendingChoice.followUp ? { ...pendingChoice.followUp } : null,
    };
  }
  if (pendingChoice?.kind === 'counterChallenge') {
    return {
      ...pendingChoice,
      originalAction: { ...pendingChoice.originalAction },
    };
  }
  return null;
};

const log = (messageKey: string, values?: GameLogEntry['values']): GameLogEntry => ({
  id: `log-${messageKey}-${Math.random().toString(36).slice(2)}`,
  messageKey,
  values,
});
