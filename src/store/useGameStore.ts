import { create } from 'zustand';
import { browserStorage } from '../adapters/storage/browserStorage';
import { botByDifficulty } from '../adapters/bot/localBots';
import { getBotMemory, observeBotMemory, resetBotMemory } from '../adapters/bot/botMemory';
import { createDefaultConfig } from '../application/defaultConfig';
import { unlockedAchievementIds } from '../application/achievementRules';
import { botPersonas } from '../config/botPersonas';
import { createGame, resolveAction } from '../domain/game/engine';
import { dailySeed } from '../domain/game/random';
import type { ActionType, BotDifficulty, GameAction, GameState, PrimaryGameAction, RoleId } from '../domain/game/types';
import type { Language } from '../i18n/translations';
import type { BotReaction } from '../ports/BotStrategy';
import type { AchievementState, ProfileState } from '../ports/GameStorage';

type Theme = 'light' | 'dark';
export type SpectatorMode = 'choose' | 'watching' | null;

export type RevealEvent = {
  id: string;
  playerId: string;
  playerName: string;
  role: RoleId;
  eliminated: boolean;
  actionType: GameAction['type'];
};

export type CardLossEvent = {
  id: string;
  playerId: string;
  playerName: string;
  role: RoleId | null;
  actionType: GameAction['type'];
  eliminated: boolean;
};

export type ChallengeEvent = {
  id: string;
  challenger: string;
  actor: string;
  claimedRole: RoleId | null;
  originalActionType: ActionType | null;
  targetName: string | null;
  loserName: string;
  outcome: 'liar' | 'truth';
};

export type CoinEvent = {
  id: string;
  from: 'bank' | string;
  to: 'bank' | string;
  amount: number;
};

export type PayoffEvent = {
  id: string;
  type: 'gotcha' | 'blocked' | 'doubleShot';
  personaName?: string;
  role?: RoleId;
};

export type FlavorEvent = {
  id: string;
  playerId: string;
  lineKey: 'claim' | 'challengeWin' | 'challengeLose' | 'bluffSuccess';
};

export type SeriesState = {
  length: 1 | 3 | 5;
  humanWins: number;
  botWins: number;
  round: number;
  matchOver: boolean;
};

export type LogRef = {
  key: string;
  values: Record<string, string | number> | undefined;
};

export type GameSummary = {
  roundCount: number;
  humanBluffsCalled: number;
  humanBluffsCaught: number;
  mostDamagingAction: LogRef;
  finalBlow: LogRef;
};

export type ProfileMatchResult = {
  humanWon: boolean;
  streak: number;
  previousStreak: number;
};

export type AchievementToast = {
  id: string;
  unlockedAt: number;
};

type GameStore = {
  game: GameState | null;
  language: Language;
  theme: Theme;
  soundMuted: boolean;
  series: SeriesState;
  profile: ProfileState;
  achievements: AchievementState;
  profileMatchResult: ProfileMatchResult | null;
  achievementToast: AchievementToast | null;
  payoffEvent: PayoffEvent | null;
  flavorEvent: FlavorEvent | null;
  gameSummary: GameSummary | null;
  revealEvent: RevealEvent | null;
  cardLossEvent: CardLossEvent | null;
  challengeEvent: ChallengeEvent | null;
  coinEvent: CoinEvent | null;
  spectatorMode: SpectatorMode;
  playerCount: number;
  botDifficulty: BotDifficulty;
  reactTimerSeconds: number;
  forcedLandscape: boolean;
  startGame(): void;
  newGame(): void;
  backToSetup(): void;
  nextRound(): void;
  resetProfile(): void;
  unlockAchievement(id: string): void;
  startDailyGame(): void;
  act(action: GameAction): void;
  chooseBotAction(): PrimaryGameAction | null;
  chooseBotReaction(botId: string, pendingAction: PrimaryGameAction): BotReaction;
  chooseBotCounterChallenge(botId: string, blockingRole: RoleId): boolean;
  resolveBotAction(action: GameAction): void;
  runBotTurn(): void;
  setLanguage(language: Language): void;
  setTheme(theme: Theme): void;
  setSoundMuted(soundMuted: boolean): void;
  setSeriesLength(length: 1 | 3 | 5): void;
  clearPayoffEvent(id?: string): void;
  clearFlavorEvent(id?: string): void;
  clearRevealEvent(id?: string): void;
  clearCardLossEvent(id?: string): void;
  clearChallengeEvent(id?: string): void;
  clearCoinEvent(id?: string): void;
  clearAchievementToast(id?: string): void;
  setSpectatorMode(mode: SpectatorMode): void;
  setPlayerCount(playerCount: number): void;
  setBotDifficulty(botDifficulty: BotDifficulty): void;
  setReactTimerSeconds(seconds: number): void;
  setForcedLandscape(value: boolean): void;
};

const savedSettings = typeof localStorage === 'undefined' ? null : browserStorage.loadSettings();
const savedGame = typeof localStorage === 'undefined' ? null : browserStorage.loadGame();
const savedProfile = typeof localStorage === 'undefined' ? null : browserStorage.loadProfile();

const defaultSeries = (length: 1 | 3 | 5): SeriesState => ({
  length,
  humanWins: 0,
  botWins: 0,
  round: 1,
  matchOver: false,
});

export const defaultProfile = (): ProfileState => ({
  lifetimeWins: 0,
  lifetimeLosses: 0,
  currentStreak: 0,
  bestStreak: 0,
  perPersona: {},
  firstWinAt: null,
  matchesPlayed: 0,
  achievements: defaultAchievements(),
  dailyCompleted: {},
});

const defaultAchievements = (): AchievementState => ({ unlocked: {} });

const normalizeProfile = (profile: ProfileState | null): ProfileState => ({
  ...defaultProfile(),
  ...(profile ?? {}),
  achievements: {
    unlocked: {
      ...(profile?.achievements?.unlocked ?? {}),
    },
  },
  dailyCompleted: {
    ...(profile?.dailyCompleted ?? {}),
  },
});

const savedProfileState = normalizeProfile(savedProfile);

export const useGameStore = create<GameStore>((set, get) => ({
  game: savedGame,
  language: savedSettings?.language ?? 'en',
  theme: savedSettings?.theme ?? 'dark',
  soundMuted: savedSettings?.soundMuted ?? false,
  series: defaultSeries(savedSettings?.seriesLength ?? 1),
  profile: savedProfileState,
  achievements: savedProfileState.achievements,
  profileMatchResult: null,
  achievementToast: null,
  payoffEvent: null,
  flavorEvent: null,
  gameSummary: null,
  revealEvent: null,
  cardLossEvent: null,
  challengeEvent: null,
  coinEvent: null,
  spectatorMode: null,
  playerCount: 4,
  botDifficulty: 'medium',
  reactTimerSeconds: savedSettings?.reactTimerSeconds ?? 12,
  forcedLandscape: false,
  startGame() {
    resetBotMemory();
    const game = assignBotPersonas(createGame(createDefaultConfig(get().playerCount, get().botDifficulty)));
    browserStorage.saveGame(game);
    set({
      game,
      series: defaultSeries(get().series.length),
      revealEvent: null,
      cardLossEvent: null,
      challengeEvent: null,
      coinEvent: null,
      payoffEvent: null,
      flavorEvent: null,
      gameSummary: null,
      profileMatchResult: null,
      spectatorMode: null,
    });
  },
  startDailyGame() {
    resetBotMemory();
    const game = assignBotPersonas(createGame(createDefaultConfig(get().playerCount, get().botDifficulty, dailySeed())));
    browserStorage.saveGame(game);
    set({
      game,
      series: defaultSeries(1),
      revealEvent: null,
      cardLossEvent: null,
      challengeEvent: null,
      coinEvent: null,
      payoffEvent: null,
      flavorEvent: null,
      gameSummary: null,
      profileMatchResult: null,
      spectatorMode: null,
    });
  },
  newGame() {
    browserStorage.clearGame();
    resetBotMemory();
    const game = assignBotPersonas(createGame(createDefaultConfig(get().playerCount, get().botDifficulty)));
    browserStorage.saveGame(game);
    set({
      game,
      series: defaultSeries(get().series.length),
      revealEvent: null,
      cardLossEvent: null,
      challengeEvent: null,
      coinEvent: null,
      payoffEvent: null,
      flavorEvent: null,
      gameSummary: null,
      profileMatchResult: null,
      spectatorMode: null,
    });
  },
  backToSetup() {
    browserStorage.clearGame();
    resetBotMemory();
    set({
      game: null,
      revealEvent: null,
      cardLossEvent: null,
      challengeEvent: null,
      coinEvent: null,
      payoffEvent: null,
      flavorEvent: null,
      gameSummary: null,
      series: defaultSeries(get().series.length),
      profileMatchResult: null,
      spectatorMode: null,
    });
  },
  nextRound() {
    const game = assignBotPersonas(createGame(createDefaultConfig(get().playerCount, get().botDifficulty)));
    browserStorage.saveGame(game);
    set({
      game,
      series: { ...get().series, round: get().series.round + 1 },
      revealEvent: null,
      cardLossEvent: null,
      challengeEvent: null,
      coinEvent: null,
      payoffEvent: null,
      flavorEvent: null,
      gameSummary: null,
      profileMatchResult: null,
      spectatorMode: null,
    });
  },
  resetProfile() {
    const profile = defaultProfile();
    browserStorage.clearProfile();
    set({ profile, achievements: profile.achievements, profileMatchResult: null, achievementToast: null });
  },
  unlockAchievement(id) {
    const profile = get().profile;
    if (profile.achievements.unlocked[id] !== undefined) {
      return;
    }
    const unlockedAt = Date.now();
    const achievements = {
      unlocked: {
        ...profile.achievements.unlocked,
        [id]: unlockedAt,
      },
    };
    const nextProfile = { ...profile, achievements };
    browserStorage.saveProfile(nextProfile);
    set({ profile: nextProfile, achievements, achievementToast: { id, unlockedAt } });
  },
  act(action) {
    const game = get().game;
    if (!game) {
      return;
    }
    const next = resolveAction(game, action);
    observeBotMemory(game, next, action);
    const nextSeries = updateSeries(get().series, game, next);
    const profileUpdate = updateProfile(get().profile, game, next);
    const achievementUpdate = updateAchievements(get().profile, profileUpdate?.profile ?? get().profile, game, next, action, nextSeries);
    const nextProfile = achievementUpdate.profile;
    if (profileUpdate || achievementUpdate.unlockedId) {
      browserStorage.saveProfile(nextProfile);
    }
    browserStorage.saveGame(next);
    set({
      game: next,
      series: nextSeries,
      profile: nextProfile,
      achievements: nextProfile.achievements,
      profileMatchResult: profileUpdate?.result ?? get().profileMatchResult,
      achievementToast: achievementUpdate.unlockedId
        ? { id: achievementUpdate.unlockedId, unlockedAt: nextProfile.achievements.unlocked[achievementUpdate.unlockedId] }
        : get().achievementToast,
      revealEvent: createRevealEvent(game, next, action),
      cardLossEvent: createCardLossEvent(game, next, action),
      challengeEvent: createChallengeEvent(game, next, action),
      coinEvent: createCoinEvent(game, next, action),
      payoffEvent: createPayoffEvent(game, next, action),
      flavorEvent: createFlavorEvent(game, next, action),
      gameSummary: next.phase === 'complete' && game.phase !== 'complete' ? createGameSummary(next) : get().gameSummary,
      spectatorMode: nextSpectatorMode(game, next, get().spectatorMode),
    });
  },
  chooseBotAction() {
    const game = get().game;
    if (!game || game.phase === 'complete') {
      return null;
    }
    const bot = game.players.find((player) => player.id === game.currentPlayerId && player.kind === 'bot');
    if (!bot) {
      return null;
    }
    const strategy = botByDifficulty[game.config.botDifficulty];
    return strategy.chooseAction(game, bot.id, getBotMemory()) as PrimaryGameAction;
  },
  chooseBotReaction(botId, pendingAction) {
    const game = get().game;
    if (!game || game.phase === 'complete') {
      return { kind: 'pass' };
    }
    const bot = game.players.find((player) => player.id === botId && player.kind === 'bot');
    if (!bot) {
      return { kind: 'pass' };
    }
    const strategy = botByDifficulty[game.config.botDifficulty];
    return strategy.chooseReaction(game, bot.id, pendingAction, getBotMemory());
  },
  chooseBotCounterChallenge(botId, blockingRole) {
    const game = get().game;
    if (!game || game.phase === 'complete') {
      return false;
    }
    const bot = game.players.find((player) => player.id === botId && player.kind === 'bot');
    if (!bot) {
      return false;
    }
    const strategy = botByDifficulty[game.config.botDifficulty];
    return strategy.chooseCounterChallenge(game, bot.id, blockingRole, getBotMemory());
  },
  resolveBotAction(action) {
    get().act(action);
  },
  runBotTurn() {
    const action = get().chooseBotAction();
    if (action) {
      get().resolveBotAction(action);
    }
  },
  setLanguage(language) {
    const { theme, soundMuted, series, reactTimerSeconds } = get();
    browserStorage.saveSettings({ language, theme, soundMuted, seriesLength: series.length, reactTimerSeconds });
    set({ language });
  },
  setTheme(theme) {
    const { language, soundMuted, series, reactTimerSeconds } = get();
    browserStorage.saveSettings({ language, theme, soundMuted, seriesLength: series.length, reactTimerSeconds });
    set({ theme });
  },
  setSoundMuted(soundMuted) {
    const { language, theme, series, reactTimerSeconds } = get();
    browserStorage.saveSettings({ language, theme, soundMuted, seriesLength: series.length, reactTimerSeconds });
    set({ soundMuted });
  },
  setSeriesLength(length) {
    const { language, theme, soundMuted, reactTimerSeconds } = get();
    browserStorage.saveSettings({ language, theme, soundMuted, seriesLength: length, reactTimerSeconds });
    set({ series: defaultSeries(length) });
  },
  clearPayoffEvent(id) {
    const event = get().payoffEvent;
    if (!id || event?.id === id) {
      set({ payoffEvent: null });
    }
  },
  clearFlavorEvent(id) {
    const event = get().flavorEvent;
    if (!id || event?.id === id) {
      set({ flavorEvent: null });
    }
  },
  clearRevealEvent(id) {
    const event = get().revealEvent;
    if (!id || event?.id === id) {
      set({ revealEvent: null });
    }
  },
  clearCardLossEvent(id) {
    const event = get().cardLossEvent;
    if (!id || event?.id === id) {
      set({ cardLossEvent: null });
    }
  },
  clearChallengeEvent(id) {
    const event = get().challengeEvent;
    if (!id || event?.id === id) {
      set({ challengeEvent: null });
    }
  },
  clearCoinEvent(id) {
    const event = get().coinEvent;
    if (!id || event?.id === id) {
      set({ coinEvent: null });
    }
  },
  clearAchievementToast(id) {
    const event = get().achievementToast;
    if (!id || event?.id === id) {
      set({ achievementToast: null });
    }
  },
  setSpectatorMode(mode) {
    set({ spectatorMode: mode });
  },
  setPlayerCount(playerCount) {
    set({ playerCount });
  },
  setBotDifficulty(botDifficulty) {
    set({ botDifficulty });
  },
  setReactTimerSeconds(reactTimerSeconds) {
    const { language, theme, soundMuted, series } = get();
    browserStorage.saveSettings({ language, theme, soundMuted, seriesLength: series.length, reactTimerSeconds });
    set({ reactTimerSeconds });
  },
  setForcedLandscape(forcedLandscape) {
    set({ forcedLandscape });
  },
}));

const liveCardCount = (state: GameState, playerId: string) =>
  state.players.find((player) => player.id === playerId)?.cards.filter((card) => card.status === 'alive').length ?? 0;

const shouldChooseSpectatorMode = (prev: GameState, next: GameState) => {
  const humanId = next.config.humanPlayerId;
  return (
    next.phase !== 'complete' &&
    next.pendingChoice?.kind !== 'replaceProvenCard' &&
    liveCardCount(prev, humanId) > 0 &&
    liveCardCount(next, humanId) === 0
  );
};

const nextSpectatorMode = (prev: GameState, next: GameState, current: SpectatorMode): SpectatorMode => {
  const humanId = next.config.humanPlayerId;
  if (liveCardCount(next, humanId) > 0) {
    return null;
  }
  return shouldChooseSpectatorMode(prev, next) ? 'choose' : current;
};

const assignBotPersonas = (game: GameState): GameState => {
  let botIndex = 0;
  return {
    ...game,
    players: game.players.map((player) => {
      if (player.kind !== 'bot') {
        return player;
      }
      const persona = botPersonas[botIndex % botPersonas.length];
      botIndex += 1;
      return { ...player, name: persona.name, personaId: persona.id };
    }),
  };
};

const updateSeries = (series: SeriesState, prev: GameState, next: GameState): SeriesState => {
  if (prev.phase === 'complete' || next.phase !== 'complete' || !next.winnerId) {
    return series;
  }
  const humanWon = next.winnerId === next.config.humanPlayerId;
  const humanWins = series.humanWins + (humanWon ? 1 : 0);
  const botWins = series.botWins + (humanWon ? 0 : 1);
  const winsNeeded = Math.ceil(series.length / 2);
  return {
    ...series,
    humanWins,
    botWins,
    matchOver: series.length === 1 || humanWins >= winsNeeded || botWins >= winsNeeded,
  };
};

const updateProfile = (
  profile: ProfileState,
  prev: GameState,
  next: GameState,
): { profile: ProfileState; result: ProfileMatchResult } | null => {
  if (prev.phase === 'complete' || next.phase !== 'complete' || !next.winnerId) {
    return null;
  }

  const humanWon = next.winnerId === next.config.humanPlayerId;
  const previousStreak = profile.currentStreak;
  const currentStreak = humanWon ? Math.max(1, previousStreak + 1) : Math.min(-1, previousStreak - 1);
  const perPersona = { ...profile.perPersona };

  for (const player of next.players) {
    if (player.kind !== 'bot' || !player.personaId) {
      continue;
    }
    const record = perPersona[player.personaId] ?? { wins: 0, losses: 0 };
    const survived = liveCardCount(next, player.id) > 0;
    perPersona[player.personaId] = {
      wins: record.wins + (survived ? 1 : 0),
      losses: record.losses + (!survived && humanWon ? 1 : 0),
    };
  }

  return {
    profile: {
      achievements: profile.achievements,
      dailyCompleted: next.config.seed
        ? {
            ...profile.dailyCompleted,
            [next.config.seed]: {
              won: humanWon,
              rounds: next.log.length,
            },
          }
        : profile.dailyCompleted,
      lifetimeWins: profile.lifetimeWins + (humanWon ? 1 : 0),
      lifetimeLosses: profile.lifetimeLosses + (humanWon ? 0 : 1),
      currentStreak,
      bestStreak: Math.max(profile.bestStreak, currentStreak),
      perPersona,
      firstWinAt: humanWon && profile.firstWinAt === null ? Date.now() : profile.firstWinAt,
      matchesPlayed: profile.matchesPlayed + 1,
    },
    result: {
      humanWon,
      streak: currentStreak,
      previousStreak,
    },
  };
};

const updateAchievements = (
  profileBefore: ProfileState,
  profileAfter: ProfileState,
  prev: GameState,
  next: GameState,
  action: GameAction,
  series: SeriesState,
): { profile: ProfileState; unlockedId: string | null } => {
  const ids = unlockedAchievementIds(profileAfter.achievements, profileBefore, profileAfter, prev, next, action, series);
  if (ids.length === 0) {
    return { profile: profileAfter, unlockedId: null };
  }
  const unlockedAt = Date.now();
  const achievements = {
    unlocked: {
      ...profileAfter.achievements.unlocked,
      ...Object.fromEntries(ids.map((id) => [id, unlockedAt])),
    },
  };
  return { profile: { ...profileAfter, achievements }, unlockedId: ids[0] };
};

const createRevealEvent = (prev: GameState, next: GameState, action: GameAction): RevealEvent | null => {
  for (const nextPlayer of next.players) {
    const prevPlayer = prev.players.find((player) => player.id === nextPlayer.id);
    if (!prevPlayer) continue;
    const revealed = nextPlayer.cards.find((nextCard) => {
      const prevCard = prevPlayer.cards.find((card) => card.id === nextCard.id);
      return prevCard?.status === 'alive' && nextCard.status === 'revealed';
    });
    if (!revealed) continue;
    return {
      id: `reveal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      playerId: nextPlayer.id,
      playerName: nextPlayer.name,
      role: revealed.role,
      eliminated: liveCardCount(prev, nextPlayer.id) > 0 && liveCardCount(next, nextPlayer.id) === 0,
      actionType: action.type,
    };
  }
  return null;
};

export const createCardLossEvent = (prev: GameState, next: GameState, action: GameAction): CardLossEvent | null => {
  for (const nextPlayer of next.players) {
    const prevPlayer = prev.players.find((player) => player.id === nextPlayer.id);
    if (!prevPlayer) continue;
    if (nextPlayer.cards.length >= prevPlayer.cards.length) continue;
    const lostCard = prevPlayer.cards.find((card) => !nextPlayer.cards.some((nextCard) => nextCard.id === card.id));
    return {
      id: `loss-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      playerId: nextPlayer.id,
      playerName: nextPlayer.name,
      role: lostCard?.role ?? null,
      actionType: action.type,
      eliminated: liveCardCount(prev, nextPlayer.id) > 0 && liveCardCount(next, nextPlayer.id) === 0,
    };
  }
  return null;
};

const createChallengeEvent = (prev: GameState, next: GameState, action: GameAction): ChallengeEvent | null => {
  const entry = next.log[next.log.length - 1];
  if (!entry?.messageKey.startsWith('challenge.')) {
    return null;
  }
  const pendingFollowUp = prev.pendingChoice?.kind === 'revealCard' ? prev.pendingChoice.followUp : null;
  const actionFromLog = pendingFollowUp ?? actionFromChallengeLog(action, next);
  const originalActionType = action.type === 'challenge' ? action.originalAction.type : actionFromLog?.type ?? null;
  const claimedRole =
    action.type === 'challenge'
      ? action.claimedRole
      : prev.pendingChoice?.kind === 'revealCard'
        ? prev.pendingChoice.source.claimedRole ?? roleFromLogValue(entry.values?.role)
        : roleFromLogValue(entry.values?.role);
  const targetName =
    action.type === 'challenge'
      ? targetNameForAction(next, action.originalAction)
      : actionFromLog
        ? targetNameForAction(next, actionFromLog)
        : null;
  const outcome = entry.messageKey === 'challenge.actorLost' ? 'liar' : 'truth';
  return {
    id: `challenge-${entry.id}`,
    challenger: String(entry.values?.challenger ?? ''),
    actor: String(entry.values?.actor ?? ''),
    claimedRole,
    originalActionType,
    targetName,
    loserName: outcome === 'liar' ? String(entry.values?.actor ?? '') : String(entry.values?.challenger ?? ''),
    outcome,
  };
};

const actionFromChallengeLog = (action: GameAction, state: GameState): PrimaryGameAction | null => {
  if (action.type !== 'chooseRevealCard') {
    return null;
  }
  const challengeEntry = [...state.log].reverse().find((entry) => entry.messageKey === 'challenge.challengerLost');
  const actorName = String(challengeEntry?.values?.actor ?? '');
  const actor = state.players.find((player) => player.name === actorName);
  const role = roleFromLogValue(challengeEntry?.values?.role);
  if (!actor || !role) {
    return null;
  }
  const type = role === 'leader' ? 'tax' : role === 'officer' ? 'attack' : role === 'thief' ? 'steal' : role === 'helper' ? 'exchange' : null;
  return type ? ({ type, actorId: actor.id } as PrimaryGameAction) : null;
};

const roleFromLogValue = (value: unknown): RoleId | null => {
  const role = String(value ?? '');
  return role === 'leader' || role === 'officer' || role === 'thief' || role === 'helper' || role === 'reporter'
    ? role
    : null;
};

const targetNameForAction = (state: GameState, action: PrimaryGameAction): string | null => {
  if (!('targetId' in action)) {
    return null;
  }
  return state.players.find((player) => player.id === action.targetId)?.name ?? null;
};

const createPayoffEvent = (prev: GameState, next: GameState, action: GameAction): PayoffEvent | null => {
  if (action.type === 'chooseRevealCard' || action.type === 'chooseExchangeKeep' || action.type === 'chooseReplacementCard' || action.type === 'chooseCounterChallenge') {
    return null;
  }
  const humanId = next.config.humanPlayerId;
  if (action.type === 'challenge' && action.challengerId === humanId) {
    const actor = next.players.find((player) => player.id === action.actorId);
    const actorLost = liveCardCount(next, action.actorId) < liveCardCount(prev, action.actorId);
    if (actorLost) {
      return {
        id: `payoff-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'gotcha',
        personaName: actor?.name,
      };
    }
  }
  if (action.type === 'block' && action.blockerId === humanId) {
    return {
      id: `payoff-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: 'blocked',
      role: action.blockingRole,
    };
  }
  if (action.type === 'eliminate' && action.actorId === humanId && 'targetId' in action) {
    const target = next.players.find((player) => player.id === action.targetId);
    if (target && liveCardCount(prev, target.id) > 0 && liveCardCount(next, target.id) === 0) {
      return {
        id: `payoff-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: 'doubleShot',
        personaName: target.name,
      };
    }
  }
  return null;
};

const createFlavorEvent = (prev: GameState, next: GameState, action: GameAction): FlavorEvent | null => {
  if (action.type === 'chooseRevealCard' || action.type === 'chooseExchangeKeep' || action.type === 'chooseReplacementCard' || action.type === 'chooseCounterChallenge') {
    return null;
  }
  if (action.type !== 'challenge' && action.type !== 'block' && action.actorId !== next.config.humanPlayerId) {
    const roleAction = action.type === 'tax' || action.type === 'exchange' || action.type === 'steal' || action.type === 'attack';
    if (roleAction) {
      return {
        id: `flavor-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        playerId: action.actorId,
        lineKey: 'claim',
      };
    }
  }
  if (action.type === 'challenge') {
    const actorLost = liveCardCount(next, action.actorId) < liveCardCount(prev, action.actorId);
    const botId = action.actorId !== next.config.humanPlayerId ? action.actorId : action.challengerId;
    return {
      id: `flavor-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      playerId: botId,
      lineKey: actorLost ? 'challengeLose' : 'challengeWin',
    };
  }
  return null;
};

const createGameSummary = (state: GameState): GameSummary => {
  const humanId = state.config.humanPlayerId;
  const human = state.players.find((player) => player.id === humanId);
  const challengeEntries = state.log.filter((entry) => entry.messageKey.startsWith('challenge.'));
  const humanBluffsCalled = challengeEntries.filter((entry) => entry.values?.challenger === human?.name).length;
  const humanBluffsCaught = challengeEntries.filter(
    (entry) => entry.values?.actor === human?.name && entry.messageKey === 'challenge.actorLost',
  ).length;
  const damageEntry =
    [...state.log].reverse().find((entry) => entry.messageKey === 'action.eliminate') ??
    [...state.log].reverse().find((entry) => entry.messageKey === 'action.attack');
  const finalEntry = state.log[state.log.length - 1];
  const fallback: LogRef = { key: 'gameStarted', values: undefined };

  return {
    roundCount: Math.floor(state.turnCount / Math.max(1, state.players.length)) + 1,
    humanBluffsCalled,
    humanBluffsCaught,
    mostDamagingAction: damageEntry
      ? { key: damageEntry.messageKey, values: damageEntry.values }
      : fallback,
    finalBlow: finalEntry
      ? { key: finalEntry.messageKey, values: finalEntry.values }
      : fallback,
  };
};

const createCoinEvent = (prev: GameState, next: GameState, action: GameAction): CoinEvent | null => {
  if (action.type === 'chooseRevealCard' || action.type === 'chooseExchangeKeep' || action.type === 'chooseReplacementCard' || action.type === 'chooseCounterChallenge') {
    return null;
  }
  const moneyAction = action.type === 'challenge' ? action.originalAction : action;
  const actorPrev = prev.players.find((player) => player.id === moneyAction.actorId);
  const actorNext = next.players.find((player) => player.id === moneyAction.actorId);
  if (!actorPrev || !actorNext) {
    return null;
  }
  const actorDelta = actorNext.money - actorPrev.money;
  let from: CoinEvent['from'] = actorDelta > 0 ? 'bank' : moneyAction.actorId;
  let to: CoinEvent['to'] = actorDelta > 0 ? moneyAction.actorId : 'bank';
  let amount = Math.abs(actorDelta);

  if ('targetId' in moneyAction) {
    const targetPrev = prev.players.find((player) => player.id === moneyAction.targetId);
    const targetNext = next.players.find((player) => player.id === moneyAction.targetId);
    const targetDelta = targetPrev && targetNext ? targetNext.money - targetPrev.money : 0;
    if (moneyAction.type === 'steal' && targetDelta < 0 && actorDelta > 0) {
      from = moneyAction.targetId;
      to = moneyAction.actorId;
      amount = Math.min(Math.abs(targetDelta), actorDelta);
    }
  }

  if (amount <= 0) {
    return null;
  }
  return {
    id: `coin-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    from,
    to,
    amount,
  };
};
