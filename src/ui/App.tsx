import { ArrowLeft, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { translations } from '../i18n/translations';
import { GameScreen } from './screens/GameScreen';
import { SetupScreen } from './screens/SetupScreen';
import { AchievementToast } from './widgets/AchievementToast';
import { useForceLandscape } from './hooks/useForceLandscape';

export const App = () => {
  const { game, language, theme, soundMuted, achievementToast, backToSetup, setLanguage, setTheme, setSoundMuted, clearAchievementToast } =
    useGameStore();
  const t = translations[language];
  const achievementCopy = achievementToast ? t.achievements[achievementToast.id] : null;

  useForceLandscape();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.lang = language;
  }, [language, theme]);

  return (
    <main className="app-shell relative min-h-[100dvh] text-app">
      {/* Backdrop */}
      <div className="app-backdrop absolute inset-0 -z-10" />

      <div className="app-frame relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col px-3 pb-4 pt-3 sm:px-6">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-token-soft pb-3 sm:gap-3">
          <div className="flex items-center gap-3">
            <span className="surface-strong grid h-9 w-9 place-items-center rounded-full border font-display text-lg font-black gold-text">
              S
            </span>
            <div className="leading-tight">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brass">power · deception · elimination</p>
              <h1 className="font-display text-2xl font-black tracking-wide sm:text-3xl gold-text">{t.gameTitle}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {game ? (
              <button
                type="button"
                onClick={backToSetup}
                className="surface-control inline-flex min-h-11 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-black sm:min-h-9"
              >
                <ArrowLeft size={14} />
                <span className="hidden xs:inline">{t.common.backToSetup}</span>
              </button>
            ) : null}
            <select
              aria-label={t.common.language}
              className="surface-control min-h-11 rounded-full border px-3 py-1.5 text-sm font-bold sm:min-h-9"
              value={language}
              onChange={(event) => setLanguage(event.target.value === 'bn' ? 'bn' : 'en')}
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </select>
            <button
              type="button"
              onClick={() => setSoundMuted(!soundMuted)}
              aria-label={soundMuted ? t.common.unmuteSound : t.common.muteSound}
              title={t.common.sound}
              className="surface-control grid h-11 w-11 place-items-center rounded-full border sm:h-9 sm:w-9"
            >
              {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? t.common.light : t.common.dark}
              className="surface-control grid h-11 w-11 place-items-center rounded-full border sm:h-9 sm:w-9"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>
        {game ? <GameScreen /> : <SetupScreen />}
      </div>
      {achievementToast && achievementCopy ? (
        <AchievementToast
          id={achievementToast.id}
          eyebrow={t.common.achievementUnlocked}
          name={achievementCopy.name}
          description={achievementCopy.description}
          onClose={() => clearAchievementToast(achievementToast.id)}
        />
      ) : null}
    </main>
  );
};
