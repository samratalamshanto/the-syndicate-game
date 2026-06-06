import type { GameConfig } from '../domain/game/types';

export const createDefaultConfig = (playerCount: number, botDifficulty: GameConfig['botDifficulty'], seed?: string): GameConfig => {
  const copies = Math.max(3, Math.ceil((playerCount * 2 + 3) / 5));

  return {
    playerCount,
    humanPlayerId: 'player-1',
    startingMoney: 2,
    maxMoney: 10,
    cardsPerPlayer: 2,
    roleCopies: {
      leader: copies,
      officer: copies,
      thief: copies,
      helper: copies,
      reporter: copies,
    },
    botDifficulty,
    seed,
  };
};
