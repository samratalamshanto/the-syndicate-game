import { ArrowRight, Award, Bot, BookOpen, Lock, Minus, Play, Plus, RotateCcw, Trophy, Users } from 'lucide-react';
import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { translations } from '../../i18n/translations';
import { GuidePanel } from '../widgets/GuidePanel';
import { Tutorial } from '../widgets/Tutorial';
import { GameCard } from '../widgets/GameCard';
import { Modal } from '../widgets/Modal';
import { roleOrder } from '../../config/branding';
import { botPersonas } from '../../config/botPersonas';
import type { BotDifficulty } from '../../domain/game/types';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { achievementIds } from '../../application/achievementRules';

const difficultyOrder: BotDifficulty[] = ['easy', 'medium', 'hard'];

export const SetupScreen = () => {
  const {
    language,
    playerCount,
    humanCount,
    botDifficulty,
    profile,
    achievements,
    setPlayerCount,
    setHumanCount,
    setBotDifficulty,
    startGame,
    resetProfile,
  } = useGameStore();
  const t = translations[language];
  const difficulties = difficultyOrder.map((value) => ({ value, ...t.setup.difficulties[value] }));
  const [guideOpen, setGuideOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  // First-run teaching happens AFTER the player commits to Start (clean first screen
  // first), not as a modal over setup. On first Start, run the tutorial, then play.
  const handleStart = () => {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem('syndicate.introSeen')) {
      localStorage.setItem('syndicate.introSeen', '1');
      setTutorialOpen(true);
      return;
    }
    startGame();
  };
  const [profileOpen, setProfileOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 640px)');
  const unlockedCount = Object.keys(achievements.unlocked).length;

  return (
    <section className="setup-screen relative mx-auto grid w-full max-w-3xl flex-1 gap-6 py-6">
      {/* HERO LEFT */}
      <div className="grid gap-4 sm:gap-6">
        <div className="grid gap-3 sm:gap-4">
          <h2 className="font-display text-5xl font-black leading-[1.05] tracking-wide text-app sm:text-6xl">{t.gameTitle}</h2>
          <p className="setup-tagline text-app-muted mt-3 max-w-xl text-base lg:whitespace-nowrap">{t.subtitle}</p>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="setup-tagline group inline-flex w-fit items-center gap-2 text-sm font-black text-brass hover:text-accent"
          >
            <BookOpen size={17} />
            <span>{t.common.guide}</span>
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="setup-stats grid gap-2">
          <div className="flex flex-wrap gap-4 text-sm font-black">
            <button type="button" onClick={() => setProfileOpen((open) => !open)} className="inline-flex items-center gap-2 text-app-muted hover:text-brass">
              <Trophy size={15} className="text-brass" />
              <span>{profile.lifetimeWins} {t.common.wins}</span>
              <span>·</span>
              <span>{profile.lifetimeLosses} {t.common.losses}</span>
              <span>·</span>
              <span>{t.common.streak} {profile.currentStreak}</span>
            </button>
            <button type="button" onClick={() => setAchievementsOpen((open) => !open)} className="inline-flex items-center gap-2 text-app-muted hover:text-brass">
              <Award size={15} className="text-brass" />
              {t.common.achievements}
              <span className="text-brass">{unlockedCount}/{achievementIds.length}</span>
            </button>
          </div>

          <Modal
            open={profileOpen}
            onClose={() => {
              setProfileOpen(false);
              setConfirmResetOpen(false);
            }}
            title={t.common.lifetime}
            subtitle={`${t.common.matchesPlayed}: ${profile.matchesPlayed}`}
            icon={<Trophy size={18} />}
            size="md"
          >
            <div className="grid gap-3 text-sm">
              <div className="flex flex-wrap items-center justify-end gap-2">
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
                      className="min-h-11 rounded-full bg-alert px-4 py-2 text-sm font-black"
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
          </Modal>

          <Modal
            open={achievementsOpen}
            onClose={() => setAchievementsOpen(false)}
            title={t.common.achievements}
            icon={<Award size={18} />}
            size="lg"
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {achievementIds.map((id) => {
                  const copy = t.achievements[id];
                  const unlocked = achievements.unlocked[id] !== undefined;
                  return (
                    <button
                      key={id}
                      type="button"
                      title={copy.description}
                      className={`min-h-20 rounded-xl border p-3 text-left transition ${
                        unlocked ? 'surface-control border-brass/55' : 'surface-muted border-token-soft text-app-muted'
                      }`}
                    >
                      <span className={unlocked ? 'text-brass' : 'text-app-muted'}>
                        {unlocked ? <Award size={16} /> : <Lock size={15} />}
                      </span>
                      <span className="mt-1 block font-display text-sm font-black leading-tight">{copy.name}</span>
                      <span className="text-app-muted mt-1 line-clamp-2 block text-xs leading-snug">{copy.description}</span>
                    </button>
                  );
                })}
            </div>
          </Modal>
        </div>

        {/* Fanned character spread */}
        <div className="setup-card-spread relative h-44 overflow-visible sm:h-52">
          <div className="absolute inset-x-0 top-0 flex items-end justify-center">
            {roleOrder.map((role, idx) => {
              const center = (roleOrder.length - 1) / 2;
              const offset = idx - center;
              return (
                <div
                  key={role}
                  className="origin-bottom transition-transform duration-300 hover:-translate-y-3 hover:z-10"
                  style={{
                    transform: `rotate(${offset * (isDesktop ? 6 : 4)}deg) translateY(${
                      Math.abs(offset) * (isDesktop ? 7 : 5)
                    }px)`,
                    marginLeft: idx === 0 ? 0 : isDesktop ? '-1.35rem' : '-1rem',
                  }}
                >
                  <GameCard variant="face" role={role} size={isDesktop ? 'md' : 'sm'} fresh freshDelayMs={idx * 70} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Setup controls */}
        <div className="setup-controls surface-glass grid gap-4 rounded-2xl border p-5 backdrop-blur">
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
              min={4}
              max={8}
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className="w-full accent-brass"
            />
            <div className="setup-pips text-app-muted flex flex-wrap items-center gap-1.5">
              {Array.from({ length: humanCount }).map((_, idx) => (
                <span key={`human-${idx}`} className="grid h-6 w-6 place-items-center rounded-full bg-brass text-night">
                  <Users size={11} />
                </span>
              ))}
              {Array.from({ length: playerCount - humanCount }).map((_, idx) => (
                <span key={`bot-${idx}`} className="surface-control grid h-6 w-6 place-items-center rounded-full border text-brass">
                  <Bot size={11} />
                </span>
              ))}
            </div>
          </div>

          {/* Pass & play: how many of the seats are humans sharing this device. */}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-bold">
                <Users size={15} className="text-brass" />
                {t.setup.humans}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHumanCount(humanCount - 1)}
                  disabled={humanCount <= 1}
                  aria-label="−"
                  className="surface-control grid h-9 w-9 place-items-center rounded-full border disabled:opacity-40"
                >
                  <Minus size={15} />
                </button>
                <span className="min-w-7 rounded-full bg-brass/15 px-2 py-0.5 text-center font-display text-base font-black text-brass">
                  {humanCount}
                </span>
                <button
                  type="button"
                  onClick={() => setHumanCount(humanCount + 1)}
                  disabled={humanCount >= playerCount - 1}
                  aria-label="+"
                  className="surface-control grid h-9 w-9 place-items-center rounded-full border disabled:opacity-40"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
            <p className="text-app-muted text-[11px]">{t.setup.humansTag}</p>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-bold">{t.setup.difficulty}</p>
            <div className="grid grid-cols-3 gap-2">
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

          <div className="grid gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-success px-6 py-4 font-display text-lg font-black text-white shadow-card hover:brightness-110"
            >
              <Play size={20} />
              {t.setup.start}
            </button>
          </div>
        </div>

      </div>
      {tutorialOpen ? (
        <Tutorial
          onClose={() => {
            setTutorialOpen(false);
            startGame();
          }}
        />
      ) : null}
      <Modal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title={t.common.guide}
        subtitle={t.common.guideTeaser}
        icon={<BookOpen size={18} />}
        size="lg"
      >
        <GuidePanel />
      </Modal>
    </section>
  );
};
