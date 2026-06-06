import { requiredRoleForAction } from '../../domain/game/engine';
import type { ActionType, GameState, Player, PrimaryGameAction, RoleId } from '../../domain/game/types';
import type { BotStrategy } from '../../ports/BotStrategy';
import { getPersona, type BotPersonaStyle } from '../../config/botPersonas';
import { emptyMemory, memoryAdjustedBluffChance, memoryAdjustedChallengeProbability, type BotMemory } from './botMemory';

const liveCardCount = (player: Player) => player.cards.filter((card) => card.status === 'alive').length;

export const pickTarget = (state: GameState, bot: Player, intent: 'attack' | 'steal') => {
  const candidates = state.players.filter((player) => player.id !== bot.id && liveCardCount(player) > 0);
  if (candidates.length === 0) {
    return state.players[0];
  }
  const score = (player: Player) => {
    const lowCard = liveCardCount(player) === 1 ? 3 : 0;
    const money = intent === 'steal' ? player.money * 0.5 : Math.min(player.money, 5) * 0.2;
    const jitter = Math.random() * 1.2;
    return lowCard + money + jitter;
  };
  return candidates
    .map((player) => ({ player, score: score(player) }))
    .sort((a, b) => b.score - a.score)[0].player;
};

const hasRole = (bot: Player, role: RoleId) => bot.cards.some((card) => card.status === 'alive' && card.role === role);

const STYLE_BIAS: Record<BotPersonaStyle, Partial<Record<ActionType, number>>> = {
  cautious: { income: 1.4, fundRaise: 1.2, tax: 0.9, attack: 0.5, eliminate: 0.4 },
  aggressive: { income: 0.6, attack: 1.6, eliminate: 1.4, steal: 1.3, tax: 1.1 },
  unpredictable: { exchange: 1.5, steal: 1.3, attack: 1, tax: 1 },
  mirror: {},
};

type ActionCandidate = {
  type: ActionType;
  weight: number;
};

type ActionOptions = {
  cautiousEliminate?: boolean;
};

const liveScore = (player: Player) => liveCardCount(player) * 10 + player.money;

const mirrorBias = (state: GameState, bot: Player): Partial<Record<ActionType, number>> => {
  const leader = state.players
    .filter((player) => player.id !== bot.id && liveCardCount(player) > 0)
    .sort((a, b) => liveScore(b) - liveScore(a))[0];
  if (!leader) return {};
  if (leader.money >= 7) return { eliminate: 1.5, attack: 1.2 };
  if (leader.money >= 3) return { attack: 1.25, tax: 1.15, steal: 1.1 };
  return { income: 1.2, fundRaise: 1.2, exchange: 1.1 };
};

const styleBiasFor = (state: GameState, bot: Player) => {
  const style = getPersona(bot.personaId)?.style;
  if (!style) return {};
  return style === 'mirror' ? mirrorBias(state, bot) : STYLE_BIAS[style];
};

const weightedActionType = (candidates: ActionCandidate[], bias: Partial<Record<ActionType, number>>) => {
  const weighted = candidates.map((candidate) => ({
    ...candidate,
    weight: candidate.weight * (bias[candidate.type] ?? 1),
  }));
  const total = weighted.reduce((sum, candidate) => sum + candidate.weight, 0);
  let roll = Math.random() * total;
  for (const candidate of weighted) {
    roll -= candidate.weight;
    if (roll <= 0) {
      return candidate.type;
    }
  }
  return weighted[weighted.length - 1].type;
};

const hasLastCardTarget = (state: GameState, bot: Player) =>
  state.players.some((player) => player.id !== bot.id && liveCardCount(player) === 1);

const choosePracticalAction = (
  state: GameState,
  botId: string,
  bluffChance: number,
  memoryWeight = 0,
  memory: BotMemory = emptyMemory(),
  options: ActionOptions = {},
): PrimaryGameAction => {
  const bot = state.players.find((player) => player.id === botId);
  if (!bot) {
    throw new Error(`Unknown bot: ${botId}`);
  }
  const adjustedBluffChance = memoryAdjustedBluffChance(bluffChance, memoryWeight, memory);
  const aliveCount = bot.cards.filter((card) => card.status === 'alive').length;
  const hasHelper = hasRole(bot, 'helper');
  const wantsExchange = hasHelper || aliveCount < bot.cards.length || bot.money < 3;
  const canEliminate = options.cautiousEliminate ? bot.money >= 8 || (bot.money >= 7 && hasLastCardTarget(state, bot)) : bot.money >= 7;

  const candidates = ([
    { type: 'exchange', weight: wantsExchange ? (hasHelper ? 1.4 : adjustedBluffChance * 0.8) : 0.15 },
    { type: 'attack', weight: bot.money >= 3 ? (hasRole(bot, 'officer') ? 1.8 : adjustedBluffChance) : 0 },
    { type: 'steal', weight: hasRole(bot, 'thief') ? 1.6 : adjustedBluffChance },
    { type: 'tax', weight: hasRole(bot, 'leader') ? 1.5 : adjustedBluffChance },
    { type: 'fundRaise', weight: 1.1 },
    { type: 'income', weight: 1 },
    { type: 'eliminate', weight: canEliminate ? 3.5 : 0 },
  ] satisfies ActionCandidate[]).filter((candidate) => candidate.weight > 0);

  const type = weightedActionType(candidates, styleBiasFor(state, bot));
  if (type === 'steal') {
    return { type, actorId: bot.id, targetId: pickTarget(state, bot, 'steal').id };
  }
  if (type === 'attack' || type === 'eliminate') {
    return { type, actorId: bot.id, targetId: pickTarget(state, bot, 'attack').id };
  }
  return { type, actorId: bot.id } as PrimaryGameAction;
};

const blockingRoleForAction = (action: PrimaryGameAction): RoleId | null => {
  if (action.type === 'fundRaise') return 'leader';
  if (action.type === 'steal') return 'helper';
  if (action.type === 'attack') return 'reporter';
  return null;
};

const choosePracticalReaction = (
  state: GameState,
  botId: string,
  pendingAction: PrimaryGameAction,
  baseChallenge: number,
  bluffChance: number,
  memoryWeight = 0,
  memory: BotMemory = emptyMemory(),
) => {
  const bot = state.players.find((player) => player.id === botId);
  if (!bot || bot.id === pendingAction.actorId || pendingAction.type === 'income' || pendingAction.type === 'eliminate') {
    return { kind: 'pass' } as const;
  }

  const blockingRole = blockingRoleForAction(pendingAction);
  if (blockingRole) {
    const blockChance = hasRole(bot, blockingRole) ? 0.7 : bluffChance * 0.6;
    if (Math.random() < blockChance) {
      return { kind: 'block', blockingRole } as const;
    }
  }

  const challengeChance = memoryAdjustedChallengeProbability(baseChallenge, memoryWeight, requiredRoleForAction(pendingAction.type), memory);
  if (requiredRoleForAction(pendingAction.type) && Math.random() < challengeChance) {
    return { kind: 'challenge' } as const;
  }

  return { kind: 'pass' } as const;
};

const choosePracticalCounterChallenge = (
  state: GameState,
  botId: string,
  blockingRole: RoleId,
  baseChallenge: number,
  memoryWeight = 0,
  memory: BotMemory = emptyMemory(),
) => {
  const bot = state.players.find((player) => player.id === botId);
  if (!bot) return false;
  const style = getPersona(bot.personaId)?.style;
  const styleBias = style === 'aggressive' ? 1.25 : style === 'cautious' ? 0.75 : style === 'unpredictable' ? 1.05 : 1;
  const blockCount = memory.humanBlocks[blockingRole];
  const memoryBias = 1 + Math.min(0.7, blockCount * 0.15 * memoryWeight);
  return Math.random() < Math.min(0.8, baseChallenge * styleBias * memoryBias);
};

export const easyBot: BotStrategy = {
  chooseAction: (state, botId) => choosePracticalAction(state, botId, 0.08),
  chooseReaction: (state, botId, pendingAction) => choosePracticalReaction(state, botId, pendingAction, 0.05, 0.08),
  chooseCounterChallenge: (state, botId, blockingRole) => choosePracticalCounterChallenge(state, botId, blockingRole, 0.1),
};

export const mediumBot: BotStrategy = {
  chooseAction: (state, botId, memory) => choosePracticalAction(state, botId, 0.25, 0.5, memory),
  chooseReaction: (state, botId, pendingAction, memory) => choosePracticalReaction(state, botId, pendingAction, 0.18, 0.25, 0.5, memory),
  chooseCounterChallenge: (state, botId, blockingRole, memory) => choosePracticalCounterChallenge(state, botId, blockingRole, 0.25, 0.5, memory),
};

export const hardBot: BotStrategy = {
  chooseAction: (state, botId, memory) => choosePracticalAction(state, botId, 0.42, 1, memory, { cautiousEliminate: true }),
  chooseReaction: (state, botId, pendingAction, memory) => choosePracticalReaction(state, botId, pendingAction, 0.32, 0.42, 1, memory),
  chooseCounterChallenge: (state, botId, blockingRole, memory) => choosePracticalCounterChallenge(state, botId, blockingRole, 0.45, 1, memory),
};

export const botByDifficulty = {
  easy: easyBot,
  medium: mediumBot,
  hard: hardBot,
};
