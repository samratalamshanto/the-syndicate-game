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

type RandomSource = () => number;

const actionRoles: Partial<Record<GameAction['type'], RoleId>> = {
  tax: 'leader',
  attack: 'officer',
  steal: 'thief',
  exchange: 'helper',
};

export const requiredRoleForAction = (actionType: GameAction['type']) => actionRoles[actionType] ?? null;

export const createGame = (config: GameConfig, random: RandomSource = Math.random): GameState => {
  const deck = shuffle(createDeck(config), random);
  const players: Player[] = Array.from({ length: config.playerCount }, (_, index) => {
    const id = `player-${index + 1}`;
    const cards = deck.splice(0, config.cardsPerPlayer);
    return {
      id,
      name: id === config.humanPlayerId ? 'You' : `Bot ${index}`,
      kind: id === config.humanPlayerId ? 'human' : 'bot',
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

export const resolveAction = (state: GameState, action: GameAction): GameState => {
  const next = cloneState(state);
  if (action.type === 'chooseRevealCard') {
    const turnOwnerId = next.currentPlayerId;
    applyRevealChoice(next, action);
    settleAfterAction(next);
    if (next.phase !== 'complete' && state.pendingChoice !== null && next.pendingChoice === null) {
      next.currentPlayerId = nextAlivePlayerId(next, turnOwnerId);
    }
    return next;
  }
  if (action.type === 'chooseExchangeKeep') {
    const turnOwnerId = next.currentPlayerId;
    applyExchangeChoice(next, action);
    settleAfterAction(next);
    if (next.phase !== 'complete' && state.pendingChoice !== null && next.pendingChoice === null) {
      next.currentPlayerId = nextAlivePlayerId(next, turnOwnerId);
    }
    return next;
  }

  const actor = findPlayer(next, action.actorId);

  if (isEliminated(actor) || next.phase === 'complete') {
    return next;
  }

  if (action.type === 'challenge') {
    applyChallengeAction(next, action);
  } else if (action.type === 'block') {
    const blocker = findPlayer(next, action.blockerId);
    const originalActor = findPlayer(next, action.originalAction.actorId);
    next.log.push(log('block.success', {
      actor: originalActor.name,
      blocker: blocker.name,
      role: action.blockingRole,
    }));
    // TODO: actor counter-challenge.
  } else {
    applyPrimaryAction(next, action);
  }

  settleAfterAction(next);
  if (!next.winnerId && next.pendingChoice === null) {
    next.currentPlayerId = nextAlivePlayerId(next, actor.id);
  }
  return next;
};

const applyPrimaryAction = (state: GameState, action: PrimaryGameAction) => {
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
      applyExchange(state, actor);
      break;
    case 'attack':
      spend(actor, 3);
      if (requestRevealCard(state, findPlayer(state, action.targetId), 'attack', 'returnToDeck', null, {
        actorId: actor.id,
        actionType: action.type,
        claimedRole: requiredRoleForAction(action.type) ?? undefined,
      })) {
        return;
      }
      state.log.push(log('action.attack', { actor: actor.name, target: findPlayer(state, action.targetId).name }));
      break;
    case 'eliminate':
      spend(actor, 7);
      if (requestRevealCard(state, findPlayer(state, action.targetId), 'eliminate', 'returnToDeck', null, {
        actorId: actor.id,
        actionType: action.type,
      })) {
        return;
      }
      state.log.push(log('action.eliminate', { actor: actor.name, target: findPlayer(state, action.targetId).name }));
      break;
  }
};

const applyChallengeAction = (state: GameState, action: Extract<GameAction, { type: 'challenge' }>) => {
  const actor = findPlayer(state, action.actorId);
  const challenger = findPlayer(state, action.challengerId);
  const provenCard = liveCards(actor).find((card) => card.role === action.claimedRole);

  if (!provenCard) {
    if (requestRevealCard(state, actor, 'challenge_lost', 'reveal', null, {
      actorId: challenger.id,
      actionType: 'challenge',
      claimedRole: action.claimedRole,
    })) {
      return;
    }
    state.log.push(log('challenge.actorLost', { actor: actor.name, challenger: challenger.name, role: action.claimedRole }));
    return;
  }

  if (requestRevealCard(state, challenger, 'challenge_lost', 'reveal', action.originalAction, {
    actorId: actor.id,
    actionType: 'challenge',
    claimedRole: action.claimedRole,
  })) {
    return;
  }
  replaceProvenCard(state, actor, provenCard);
  state.log.push(log('challenge.challengerLost', { actor: actor.name, challenger: challenger.name, role: action.claimedRole }));

  if (!isEliminated(challenger)) {
    applyPrimaryAction(state, action.originalAction);
  }
};

export const resolveChallenge = (state: GameState, challenge: Challenge): GameState => {
  const next = cloneState(state);
  const actor = findPlayer(next, challenge.actorId);
  const challenger = findPlayer(next, challenge.challengerId);
  const provenCard = liveCards(actor).find((card) => card.role === challenge.claimedRole);

  if (!provenCard) {
    revealOneCard(actor);
    next.log.push(log('challenge.actorLost', { actor: actor.name, challenger: challenger.name }));
  } else {
    revealOneCard(challenger);
    replaceProvenCard(next, actor, provenCard);
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

const applyExchange = (state: GameState, actor: Player) => {
  const drawn = state.deck.splice(0, 2);
  const alive = liveCards(actor);
  if (actor.kind === 'human' && alive.length > 0) {
    state.pendingChoice = { kind: 'exchangeKeep', playerId: actor.id, offered: drawn };
    return;
  }
  const keep = [...alive, ...drawn].slice(0, alive.length);
  const returned = [...alive, ...drawn].slice(alive.length);
  actor.cards = [...actor.cards.filter((card) => card.status === 'revealed'), ...keep];
  state.deck.push(...returned.map((card) => ({ ...card, status: 'alive' as const })));
  state.log.push(log('action.exchange', { actor: actor.name }));
};

const replaceProvenCard = (state: GameState, actor: Player, provenCard: CharacterCard) => {
  const replacement = state.deck.shift();
  if (!replacement) {
    return;
  }
  const cardIndex = actor.cards.findIndex((card) => card.id === provenCard.id);
  actor.cards[cardIndex] = replacement;
  state.deck.push({ ...provenCard, status: 'alive' });
};

const revealOneCard = (player: Player) => {
  const card = liveCards(player)[0];
  if (card) {
    card.status = 'revealed';
  }
};

const requestRevealCard = (
  state: GameState,
  player: Player,
  cause: Exclude<NonNullable<GameState['pendingChoice']>, { kind: 'exchangeKeep' }>['cause'],
  mode: Extract<NonNullable<GameState['pendingChoice']>, { kind: 'revealCard' }>['mode'],
  followUp: PrimaryGameAction | null,
  source: Extract<NonNullable<GameState['pendingChoice']>, { kind: 'revealCard' }>['source'],
) => {
  const alive = liveCards(player);
  if (player.kind === 'human' && alive.length > 1) {
    state.pendingChoice = { kind: 'revealCard', playerId: player.id, cause, mode, followUp, source };
    return true;
  }
  if (mode === 'returnToDeck') {
    returnCardToDeck(state, player, alive[0]?.id);
  } else {
    revealOneCard(player);
  }
  return false;
};

const applyRevealChoice = (
  state: GameState,
  action: Extract<GameAction, { type: 'chooseRevealCard' }>,
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
    returnCardToDeck(state, player, card.id);
  } else {
    card.status = 'revealed';
  }
  state.pendingChoice = null;
  if (pending.followUp && !isEliminated(player)) {
    const actor = findPlayer(state, pending.followUp.actorId);
    const provenCard = liveCards(actor).find((candidate) => candidate.role === requiredRoleForAction(pending.followUp!.type));
    if (provenCard) {
      replaceProvenCard(state, actor, provenCard);
    }
    state.log.push(log('challenge.challengerLost', {
      actor: actor.name,
      challenger: player.name,
      role: requiredRoleForAction(pending.followUp.type) ?? '',
    }));
    applyPrimaryAction(state, pending.followUp);
    return;
  }
  const entry = revealLogEntry(state, pending.cause, player);
  if (entry) {
    state.log.push(entry);
  }
};

const returnCardToDeck = (state: GameState, player: Player, cardId: string | undefined) => {
  if (!cardId) {
    return;
  }
  const cardIndex = player.cards.findIndex((card) => card.id === cardId && card.status === 'alive');
  if (cardIndex < 0) {
    return;
  }
  const [card] = player.cards.splice(cardIndex, 1);
  state.deck.push({ ...card, status: 'alive' });
};

const applyExchangeChoice = (
  state: GameState,
  action: Extract<GameAction, { type: 'chooseExchangeKeep' }>,
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
  state.deck.push(...returned);
  state.pendingChoice = null;
  state.log.push(log('action.exchange', { actor: player.name }));
};

const revealLogEntry = (
  state: GameState,
  cause: Exclude<NonNullable<GameState['pendingChoice']>, { kind: 'exchangeKeep' }>['cause'],
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
  if (pendingChoice?.kind === 'revealCard') {
    return {
      ...pendingChoice,
      followUp: pendingChoice.followUp ? { ...pendingChoice.followUp } : null,
    };
  }
  return null;
};

const log = (messageKey: string, values?: GameLogEntry['values']): GameLogEntry => ({
  id: `log-${messageKey}-${Math.random().toString(36).slice(2)}`,
  messageKey,
  values,
});
