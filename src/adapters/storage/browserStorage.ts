import type { GameState } from '../../domain/game/types';
import type { GameStorage, ProfileState, SavedSettings } from '../../ports/GameStorage';

const gameKey = 'who-is-lying:game';
const settingsKey = 'who-is-lying:settings';
const profileKey = 'who-is-lying:profile';

const encode = (value: unknown) => btoa(encodeURIComponent(JSON.stringify(value)));
const decode = <T>(value: string): T => JSON.parse(decodeURIComponent(atob(value))) as T;

export const browserStorage: GameStorage = {
  loadGame() {
    const saved = localStorage.getItem(gameKey);
    return saved ? decode<GameState>(saved) : null;
  },
  saveGame(state) {
    localStorage.setItem(gameKey, encode(state));
  },
  clearGame() {
    localStorage.removeItem(gameKey);
  },
  loadSettings() {
    const saved = localStorage.getItem(settingsKey);
    return saved ? decode<SavedSettings>(saved) : null;
  },
  saveSettings(settings) {
    localStorage.setItem(settingsKey, encode(settings));
  },
  loadProfile() {
    const saved = localStorage.getItem(profileKey);
    return saved ? decode<ProfileState>(saved) : null;
  },
  saveProfile(profile) {
    localStorage.setItem(profileKey, encode(profile));
  },
  clearProfile() {
    localStorage.removeItem(profileKey);
  },
};
