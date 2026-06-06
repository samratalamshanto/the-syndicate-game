import type { GameAction, GameState } from '../domain/game/types';

export type BotStrategy = {
  chooseAction(state: GameState, botId: string): GameAction;
};
