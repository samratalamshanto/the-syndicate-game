import { Bot, BookOpen, Play, RotateCcw, Trophy, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { translations } from '../../i18n/translations';
import { GuidePanel } from '../widgets/GuidePanel';
import { GameCard } from '../widgets/GameCard';
import { roleOrder } from '../../config/branding';
import { botPersonas } from '../../config/botPersonas';
import type { BotDifficulty } from '../../domain/game/types';
import { useMediaQuery } from '../hooks/useMediaQuery';

const difficulties: { value: BotDifficulty; label: string; tag: string }[] = [
  { value: 'easy', label: 'Easy', tag: 'Forgiving · learn the ropes' },
  { value: 'medium', label: 'Medium', tag: 'Balanced bluffs' },
  { value: 'hard', label: 'Hard', tag: 'Sharper minds, riskier plays' },
];

export const SetupScreen = () => {
  const {
    language,
    playerCount,
    botDifficulty,
    series,
    profile,
    setPlayerCount,
    setBotDifficulty,
    setSeriesLength,
    startGame,
    resetProfile,
  } = useGameStore();
  const t = translations[language];
  const [guideOpen, setGuideOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 640px)');

  return (
    <section className="relative grid flex-1 gap-6 py-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
      {/* HERO LEFT */}
      <div className="grid gap-7">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-brass">a bluffing card game</p>
          <h2 className="mt-2 font-display text-5xl font-black leading-[1.05] sm:text-6xl gold-text">{t.gameTitle}</h2>
          <p className="text-app-muted mt-3 max-w-md text-base">{t.subtitle}</p>
        </div>

        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className="surface-control inline-flex min-h-11 w-fit flex-wrap items-center gap-2 rounded-full border px-4 py-2 text-sm font-black"
          >
            <Trophy size={16} className="text-brass" />
            <span>{profile.lifetimeWins} {t.common.wins}</span>
            <span className="text-app-muted">·</span>
            <span>{profile.lifetimeLosses} {t.common.losses}</span>
            <span className="text-app-muted">·</span>
            <span>{t.common.streak} {profile.currentStreak}</span>
            <span className="text-app-muted">·</span>
            <span>{t.common.streakBest} {profile.bestStreak}</span>
          </button>

          {profileOpen ? (
            <div className="surface-glass grid max-w-xl gap-3 rounded-2xl border p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display text-base font-black gold-text">{t.common.lifetime}</p>
                  <p className="text-app-muted text-xs">
                    {t.common.matchesPlayed}: {profile.matchesPlayed}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(true)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black text-ember"
                >
                  <RotateCcw size={14} />
                  {t.common.resetProfile}
                </button>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brass">{t.common.perPersona}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {botPersonas.map((persona) => {
                  const record = profile.perPersona[persona.id] ?? { wins: 0, losses: 0 };
                  return (
                    <div key={persona.id} className="surface-muted rounded-xl border border-token-soft px-3 py-2">
                      <p className="font-display font-black">{persona.name}</p>
                      <p className="text-app-muted text-xs">
                        {record.wins} {t.common.wins} · {record.losses} {t.common.losses}
                      </p>
                    </div>
                  );
                })}
              </div>
              {confirmResetOpen ? (
                <div className="grid gap-2 rounded-xl border border-ember/55 bg-ember/15 px-3 py-2">
                  <p className="text-sm font-black text-ember">{t.common.confirmReset}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetProfile();
                        setConfirmResetOpen(false);
                      }}
                      className="min-h-11 rounded-full bg-ember px-4 py-2 text-sm font-black text-paper"
                    >
                      {t.common.resetProfile}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmResetOpen(false)}
                      className="surface-control min-h-11 rounded-full border px-4 py-2 text-sm font-black"
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Fanned character spread */}
        <div className="relative h-48 sm:h-56">
          <div className="absolute inset-x-0 top-0 flex items-end justify-center">
            {roleOrder.map((role, idx) => {
              const center = (roleOrder.length - 1) / 2;
              const offset = idx - center;
              return (
                <div
                  key={role}
                  className="origin-bottom transition-transform duration-300 hover:-translate-y-3 hover:z-10"
                  style={{
                    transform: `rotate(${offset * (isDesktop ? 7 : 4)}deg) translateY(${
                      Math.abs(offset) * (isDesktop ? 8 : 5)
                    }px)`,
                    marginLeft: idx === 0 ? 0 : isDesktop ? '-1.6rem' : '-1rem',
                  }}
                >
                  <GameCard variant="face" role={role} size={isDesktop ? 'lg' : 'md'} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Setup controls */}
        <div className="surface-glass grid gap-4 rounded-2xl border p-5 backdrop-blur">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brass">{t.setup.title}</p>
          </div>

          <div className="grid gap-2">
            <label className="flex items-center justify-between gap-2 text-sm font-bold">
              <span className="inline-flex items-center gap-2">
                <Users size={15} className="text-brass" />
                {t.setup.players}
              </span>
              <span className="rounded-full bg-brass/15 px-2 py-0.5 font-display text-base font-black text-brass">
                {playerCount}
              </span>
            </label>
            <input
              type="range"
              min={3}
              max={8}
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className="w-full accent-brass"
            />
            <div className="text-app-muted flex items-center gap-1.5">
              <span className="text-xs">{t.setup.players}:</span>
              {Array.from({ length: playerCount - 1 }).map((_, idx) => (
                <span key={idx} className="surface-control grid h-6 w-6 place-items-center rounded-full border text-brass">
                  <Bot size={11} />
                </span>
              ))}
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brass text-night">
                <Users size={11} />
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-bold">{t.setup.difficulty}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setBotDifficulty(d.value)}
                  className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm transition ${
                    botDifficulty === d.value
                      ? 'border-brass bg-brass/25 shadow-gold'
                      : 'border-token-soft surface-control text-app-muted hover:border-brass/60'
                  }`}
                >
                  <p className="font-display text-base font-black">{d.label}</p>
                  <p className="text-[11px] opacity-80">{d.tag}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-bold">{t.common.series}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { value: 1 as const, label: t.common.singleGame },
                { value: 3 as const, label: t.common.bestOf3 },
                { value: 5 as const, label: t.common.bestOf5 },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSeriesLength(option.value)}
                  className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-black ${
                    series.length === option.value
                      ? 'border-brass bg-brass/25 shadow-gold'
                      : 'surface-control border-token-soft'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={startGame}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brass px-5 py-3 font-display text-base font-black text-night shadow-gold hover:brightness-110"
            >
              <Play size={18} />
              {t.setup.start}
            </button>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="surface-control inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-bold"
            >
              <BookOpen size={16} />
              {t.common.guide}
            </button>
          </div>
        </div>
      </div>

      {/* INLINE GUIDE on desktop */}
      <div className="hidden lg:block">
        <GuidePanel />
      </div>

      {/* GUIDE OVERLAY on mobile */}
      {guideOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-0 backdrop-blur-sm sm:place-items-center sm:p-3"
          onClick={() => setGuideOpen(false)}
        >
          <div
            className="bottom-sheet surface-strong relative max-h-[92dvh] w-full max-w-xl overflow-auto scroll-tight rounded-t-2xl border-2 shadow-card sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="surface-strong sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-display text-lg font-black gold-text">{t.common.guide}</h3>
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                className="grid h-11 w-11 place-items-center rounded-full border border-brass/40 sm:h-8 sm:w-8"
                aria-label={t.common.cancel}
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4">
              <GuidePanel />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
