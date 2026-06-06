import type { GameState, PrimaryGameAction, RoleId } from '../domain/game/types';
import type { BotMemory } from '../adapters/bot/botMemory';

export type BotReaction =
  | { kind: 'pass' }
  | { kind: 'challenge' }
  | { kind: 'block'; blockingRole: RoleId };

export type BotStrategy = {
  chooseAction(state: GameState, botId: string, memory?: BotMemory): PrimaryGameAction;
  chooseReaction(state: GameState, botId: string, pendingAction: PrimaryGameAction, memory?: BotMemory): BotReaction;
  chooseCounterChallenge(state: GameState, botId: string, blockingRole: RoleId, memory?: BotMemory): boolean;
};
