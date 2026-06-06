import type { GameState, PlayerSummaryView } from '../domain/game/types';
import { formatMessage, translations } from '../i18n/translations';

type T = (typeof translations)['en'];

export const selectActiveActor = (game: GameState | null, players: PlayerSummaryView[]): PlayerSummaryView | null => {
  if (!game) return null;
  return players.find((player) => player.id === game.currentPlayerId) ?? null;
};

export const selectLastEventLine = (game: GameState | null, t: T): string => {
  if (!game) return '';
  const entry = game.log[game.log.length - 1];
  const active = game.players.find((player) => player.id === game.currentPlayerId);
  if (!entry) {
    return formatMessage(t.common.lastEvent.gameStart, { actor: active?.name ?? '' });
  }
  const actor = String(entry.values?.actor ?? active?.name ?? '');
  const target = String(entry.values?.target ?? '');
  const amount = Number(entry.values?.amount ?? 0);
  const role = String(entry.values?.role ?? '');

  if (entry.messageKey === 'gameStarted') {
    return formatMessage(t.common.lastEvent.gameStart, { actor: active?.name ?? '' });
  }
  if (entry.messageKey === 'action.tax') {
    return formatMessage(t.common.lastEvent.claim, { actor, role, amount });
  }
  if (entry.messageKey === 'challenge.actorLost') {
    return formatMessage(t.common.lastEvent.challengeWon, { actor: String(entry.values?.challenger ?? ''), target: actor });
  }
  if (entry.messageKey === 'challenge.challengerLost') {
    return formatMessage(t.common.lastEvent.challengeLost, { actor: String(entry.values?.challenger ?? ''), target: actor });
  }
  if (entry.messageKey === 'block.success') {
    return formatMessage(t.common.lastEvent.blocked, {
      actor: String(entry.values?.blocker ?? ''),
      target: actor,
      action: entry.values?.action ? String(entry.values.action) : target,
    });
  }
  return formatMessage(t.common.lastEvent.generic, {
    event: formatMessage(t.logs[entry.messageKey] ?? entry.messageKey, entry.values),
  });
};

export const selectNextPlayerLine = (game: GameState | null, t: T): string => {
  if (!game || game.phase === 'complete') return '';
  const currentIndex = game.players.findIndex((player) => player.id === game.currentPlayerId);
  const next = game.players[(currentIndex + 1) % game.players.length];
  const label = next?.id === game.config.humanPlayerId ? t.common.youLabel : next?.name;
  return label ? `${t.common.next}: ${label}` : '';
};
