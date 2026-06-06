import { requiredRoleForAction } from '../../domain/game/engine';
import type { GameAction, GameState, RoleId } from '../../domain/game/types';

export type BotMemory = {
  humanRoleClaims: Record<RoleId, number>;
  humanBluffsCaught: Record<RoleId, number>;
  humanChallengesIssued: number;
  humanChallengesWon: number;
  humanBlocks: Record<RoleId, number>;
  matchActionsTotal: number;
};

const roleCounts = (): Record<RoleId, number> => ({
  leader: 0,
  officer: 0,
  thief: 0,
  helper: 0,
  reporter: 0,
});

export const emptyMemory = (): BotMemory => ({
  humanRoleClaims: roleCounts(),
  humanBluffsCaught: roleCounts(),
  humanChallengesIssued: 0,
  humanChallengesWon: 0,
  humanBlocks: roleCounts(),
  matchActionsTotal: 0,
});

let activeMemory = emptyMemory();

export const resetBotMemory = () => {
  activeMemory = emptyMemory();
};

export const getBotMemory = () => activeMemory;

export const observeBotMemory = (prev: GameState, next: GameState, action: GameAction) => {
  const humanId = next.config.humanPlayerId;
  activeMemory.matchActionsTotal += 1;

  if (action.type !== 'challenge' && action.type !== 'block' && action.type !== 'chooseRevealCard' && action.type !== 'chooseExchangeKeep' && action.type !== 'chooseReplacementCard' && action.type !== 'chooseCounterChallenge') {
    const role = requiredRoleForAction(action.type);
    if (action.actorId === humanId && role) {
      activeMemory.humanRoleClaims[role] += 1;
    }
  }

  if (action.type === 'challenge' && action.challengerId === humanId) {
    activeMemory.humanChallengesIssued += 1;
    if (next.log[next.log.length - 1]?.messageKey === 'challenge.actorLost') {
      activeMemory.humanChallengesWon += 1;
    }
  }

  if (action.type === 'challenge' && action.actorId === humanId && next.log[next.log.length - 1]?.messageKey === 'challenge.actorLost') {
    activeMemory.humanBluffsCaught[action.claimedRole] += 1;
  }

  if (
    action.type === 'chooseRevealCard' &&
    prev.pendingChoice?.kind === 'revealCard' &&
    (prev.pendingChoice.cause === 'challenge_lost' || prev.pendingChoice.cause === 'block_lost') &&
    prev.pendingChoice.playerId === humanId &&
    prev.pendingChoice.source.claimedRole
  ) {
    activeMemory.humanBluffsCaught[prev.pendingChoice.source.claimedRole] += 1;
  }

  if (action.type === 'block' && action.blockerId === humanId) {
    activeMemory.humanBlocks[action.blockingRole] += 1;
  }
};

export const memoryAdjustedChallengeProbability = (baseChallenge: number, memoryWeight: number, role: RoleId | null, memory: BotMemory) => {
  if (!role || memoryWeight <= 0) {
    return baseChallenge;
  }
  const claims = memory.humanRoleClaims[role];
  if (claims === 0) {
    return baseChallenge;
  }
  const bluffRate = memory.humanBluffsCaught[role] / claims;
  return Math.min(0.85, baseChallenge * (1 + bluffRate * memoryWeight));
};

export const memoryAdjustedBluffChance = (bluffChance: number, memoryWeight: number, memory: BotMemory) => {
  if (memoryWeight <= 0 || memory.humanChallengesIssued < 3) {
    return bluffChance;
  }
  const humanChallengeWinRate = memory.humanChallengesWon / memory.humanChallengesIssued;
  if (humanChallengeWinRate >= 0.4) {
    return bluffChance;
  }
  return Math.min(0.75, bluffChance * (1 + (0.4 - humanChallengeWinRate) * memoryWeight));
};
