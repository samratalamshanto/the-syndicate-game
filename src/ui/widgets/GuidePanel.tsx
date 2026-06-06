import { ArrowDown, ArrowRight, BadgeHelp, Coins, ShieldX, Trophy } from 'lucide-react';
import { useState } from 'react';
import { roleOrder } from '../../config/branding';
import { formatMessage, translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { RolePortrait } from './RolePortrait';
import { RulesDetailPage } from './RulesDetailPage';

type Props = {
  compact?: boolean;
};

export const GuidePanel = ({ compact = false }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <section className="surface-glass rounded-lg border p-4 shadow-card">
      <div className="flex items-center gap-2 text-brass">
        <BadgeHelp size={18} />
        <h2 className="font-display text-xl font-black">{t.guide.title}</h2>
      </div>
      <p className="text-app-muted mt-2 text-sm">{t.guide.intro}</p>

      {compact ? (
        <div className="mt-4 grid gap-3">
          <div className="grid gap-2 text-center text-xs font-bold sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
            <span className="inverse-button rounded-md px-2 py-2">
              <span>1. </span><span>Action</span>
            </span>
            <ArrowRight size={16} className="mx-auto hidden sm:block" />
            <span className="rounded-md bg-brass px-2 py-2 text-night">
              <span>2. </span><span>Challenge</span>
            </span>
            <ArrowRight size={16} className="mx-auto hidden sm:block" />
            <span className="inline-flex items-center justify-center gap-1 rounded-md bg-jade px-2 py-2 text-white">
              <Trophy size={14} /> <span>3. </span><span>Resolve</span>
            </span>
          </div>
          <div className="surface-muted rounded-xl border border-token-soft px-3 py-3 text-sm">
            <p>{t.guide.turn}</p>
            <p className="mt-2 font-bold text-brass">
              {t.common.lastCard}: {t.common.eliminated}. {t.common.react}: {t.common.challengeAction} / {t.common.pass}.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-token bg-accent px-4 py-3 font-display text-lg font-black text-[var(--inverse-on)]">
          {t.common.lastCard}: {t.common.eliminated}. {t.common.react}: {t.common.challengeAction} / {t.common.pass}.
        </div>
      )}

      {!compact ? (
      <div className="mt-4 grid gap-3">
        <div className="grid gap-2 text-center text-xs font-bold sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <span className="inverse-button rounded-md px-2 py-2">
            <span>1. </span><span>Action</span>
          </span>
          <ArrowDown size={16} className="mx-auto sm:hidden" />
          <ArrowRight size={16} className="mx-auto hidden sm:block" />
          <span className="rounded-md bg-brass px-2 py-2 text-night">
            <span>2. </span><span>Challenge</span>
          </span>
          <ArrowDown size={16} className="mx-auto sm:hidden" />
          <ArrowRight size={16} className="mx-auto hidden sm:block" />
          <span className="inline-flex items-center justify-center gap-1 rounded-md bg-jade px-2 py-2 text-white">
            <Trophy size={14} /> <span>3. </span><span>Resolve</span>
          </span>
        </div>

        <details open className="surface-muted rounded-xl border border-token-soft px-3 py-2">
          <summary className="cursor-pointer font-display font-black text-brass">{t.common.guide}</summary>
          <div className="mt-2 grid gap-2 text-sm">
            <p>{t.guide.turn}</p>
            <p>{t.guide.challenge}</p>
            <div className="flex items-center gap-2 font-bold">
              <Coins size={16} />
              {t.guide.money}
            </div>
            <div className="flex items-center gap-2 font-bold text-ember">
              <ShieldX size={16} />
              {formatMessage(t.guide.doubleLoss, { officer: t.roles.officer.name })}
            </div>
          </div>
        </details>
      </div>
      ) : null}

      {!compact ? (
        <details open className="mt-4 rounded-xl border border-token-soft px-3 py-2">
          <summary className="cursor-pointer font-display font-black text-brass">{t.common.roleActions}</summary>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {roleOrder.map((role) => (
              <div key={role} className="rounded-md border border-token-soft bg-[var(--surface)] p-2 text-sm">
                <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
                  <div className="aspect-[3/4] overflow-hidden rounded-md border border-token-soft bg-[var(--surface-muted)]">
                    <RolePortrait role={role} fill />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold">{t.roles[role].name}</p>
                    <p className="text-app-muted">{t.roles[role].power}</p>
                    <p className="text-brass">{t.roles[role].counter}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      {!compact ? (
        <div className="mt-4 grid gap-3">
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            className="surface-control min-h-11 rounded-full border px-4 py-2 font-display text-sm font-black"
          >
            {detailsOpen ? t.common.cancel : t.common.learnMoreRules}
          </button>
          {detailsOpen ? <RulesDetailPage /> : null}
        </div>
      ) : null}
    </section>
  );
};
