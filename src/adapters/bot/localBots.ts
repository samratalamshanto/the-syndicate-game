import type { GameAction, GameState, Player } from '../../domain/game/types';
import type { BotStrategy } from '../../ports/BotStrategy';

const target = (state: GameState, bot: Player) =>
  state.players.find((player) => player.id !== bot.id && player.cards.some((card) => card.status === 'alive')) ??
  state.players[0];

const hasRole = (bot: Player, role: string) => bot.cards.some((card) => card.status === 'alive' && card.role === role);

const choosePracticalAction = (state: GameState, botId: string, bluffChance: number): GameAction => {
  const bot = state.players.find((player) => player.id === botId);
  if (!bot) {
    throw new Error(`Unknown bot: ${botId}`);
  }
  const victim = target(state, bot);

  if (bot.money >= 7) {
    return { type: 'eliminate', actorId: bot.id, targetId: victim.id };
  }
  if (bot.money >= 3 && (hasRole(bot, 'officer') || Math.random() < bluffChance)) {
    return { type: 'attack', actorId: bot.id, targetId: victim.id };
  }
  if (hasRole(bot, 'thief') || Math.random() < bluffChance) {
    return { type: 'steal', actorId: bot.id, targetId: victim.id };
  }
  if (hasRole(bot, 'leader') || Math.random() < bluffChance) {
    return { type: 'tax', actorId: bot.id };
  }
  return Math.random() > 0.45 ? { type: 'fundRaise', actorId: bot.id } : { type: 'income', actorId: bot.id };
};

export const easyBot: BotStrategy = {
  chooseAction: (state, botId) => choosePracticalAction(state, botId, 0.08),
};

export const mediumBot: BotStrategy = {
  chooseAction: (state, botId) => choosePracticalAction(state, botId, 0.25),
};

export const hardBot: BotStrategy = {
  chooseAction: (state, botId) => choosePracticalAction(state, botId, 0.42),
};

export const botByDifficulty = {
  easy: easyBot,
  medium: mediumBot,
  hard: hardBot,
};
