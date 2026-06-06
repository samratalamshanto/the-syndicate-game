import type { GameState } from '../domain/game/types';
import type { Language } from '../i18n/translations';

export type SavedSettings = {
  language: Language;
  theme: 'light' | 'dark';
  soundMuted?: boolean;
  seriesLength?: 1 | 3 | 5;
  reactTimerSeconds?: number;
};

export type ProfileState = {
  lifetimeWins: number;
  lifetimeLosses: number;
  currentStreak: number;
  bestStreak: number;
  perPersona: Record<string, { wins: number; losses: number }>;
  firstWinAt: number | null;
  matchesPlayed: number;
  achievements: AchievementState;
  dailyCompleted: Record<string, DailyResult>;
};

export type AchievementState = {
  unlocked: Record<string, number>;
};

export type DailyResult = {
  won: boolean;
  rounds: number;
};

export type GameStorage = {
  loadGame(): GameState | null;
  saveGame(state: GameState): void;
  clearGame(): void;
  loadSettings(): SavedSettings | null;
  saveSettings(settings: SavedSettings): void;
  loadProfile(): ProfileState | null;
  saveProfile(profile: ProfileState): void;
  clearProfile(): void;
};
