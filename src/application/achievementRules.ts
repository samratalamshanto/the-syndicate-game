import { botPersonas } from '../config/botPersonas';
import type { GameAction, GameState } from '../domain/game/types';
import type { AchievementState, ProfileState } from '../ports/GameStorage';

type SeriesProgress = {
  length: 1 | 3 | 5;
  matchOver: boolean;
};

export const achievementIds = [
  'firstWin',
  'streak3',
  'streak5',
  'firstBluffCalled',
  'untouchable',
  'eliminator',
  'survivor',
  'hardModeWin',
  'bestOf5Win',
  ...botPersonas.map((persona) => `readPersona_${persona.id}`),
] as const;

const liveCardCount = (state: GameState, playerId: string) =>
  state.players.find((player) => player.id === playerId)?.cards.filter((card) => card.status === 'alive').length ?? 0;

const isUnlocked = (achievements: AchievementState, id: string) => achievements.unlocked[id] !== undefined;

export const unlockedAchievementIds = (
  achievements: AchievementState,
  profileBefore: ProfileState,
  profileAfter: ProfileState,
  prev: GameState,
  next: GameState,
  action: GameAction,
  series: SeriesProgress,
): string[] => {
  const ids: string[] = [];
  const add = (id: string) => {
    if (!isUnlocked(achievements, id) && !ids.includes(id)) {
      ids.push(id);
    }
  };
  const humanId = next.config.humanPlayerId;
  const humanWonMatch = prev.phase !== 'complete' && next.phase === 'complete' && next.winnerId === humanId;

  if (
    action.type === 'challenge' &&
    action.challengerId === humanId &&
    next.log[next.log.length - 1]?.messageKey === 'challenge.actorLost'
  ) {
    add('firstBluffCalled');
  }

  if (profileBefore.lifetimeWins === 0 && profileAfter.lifetimeWins > 0) add('firstWin');
  if (profileAfter.currentStreak >= 3) add('streak3');
  if (profileAfter.currentStreak >= 5) add('streak5');

  if (!humanWonMatch) {
    return ids;
  }

  const humanAliveCards = liveCardCount(next, humanId);
  const eliminatedBots = next.players.filter((player) => player.kind === 'bot' && liveCardCount(next, player.id) === 0);

  if (humanAliveCards === next.config.cardsPerPlayer) add('untouchable');
  if (humanAliveCards === 1) add('survivor');
  if (eliminatedBots.length >= 3) add('eliminator');
  if (next.config.botDifficulty === 'hard') add('hardModeWin');
  if (series.length === 5 && series.matchOver) add('bestOf5Win');

  for (const player of next.players) {
    if (player.kind === 'bot' && player.personaId) {
      add(`readPersona_${player.personaId}`);
    }
  }

  return ids;
};
