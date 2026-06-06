import { Clock3 } from 'lucide-react';
import type { PlayerSummaryView } from '../../domain/game/types';
import { formatMessage, translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

type Props = {
  actor: PlayerSummaryView | null;
  lastEvent: string;
  requiredAction?: {
    label: string;
    secondsLeft?: number;
    urgent?: boolean;
  } | null;
  fallback: string;
};

export const NowStrip = ({ actor, lastEvent, requiredAction = null, fallback }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const initials = actor?.name.slice(0, 2).toUpperCase() ?? '--';

  return (
    <section className="surface-strong grid gap-3 rounded-2xl border border-token px-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-brass bg-[var(--surface)] font-display text-sm font-black text-brass">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-black leading-tight">{actor?.name ?? t.common.table}</p>
          <p className="text-app-muted text-sm">{actor?.kind === 'human' ? t.common.youLabel : t.common.botTurn}</p>
        </div>
      </div>

      <p aria-live="polite" className="min-w-0 text-base font-bold leading-snug text-app">
        {lastEvent}
      </p>

      <p
        aria-live="assertive"
        className={`flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-sm font-black ${
          requiredAction ? (requiredAction.urgent ? 'border-ember text-ember' : 'border-brass text-brass') : 'border-token-soft text-app-muted'
        }`}
      >
        {requiredAction ? (
          <>
            <span>{t.common.yourMove} — {requiredAction.label}</span>
            {requiredAction.secondsLeft !== undefined ? (
              <span className="inline-flex items-center gap-1">
                <Clock3 size={14} />
                {formatMessage(t.common.secondsShort, { n: requiredAction.secondsLeft })}
              </span>
            ) : null}
          </>
        ) : (
          fallback
        )}
      </p>
    </section>
  );
};
