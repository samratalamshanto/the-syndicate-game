import { CheckCircle2, Pause, Play, Shield, ShieldAlert, Timer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { requiredRoleForAction } from '../../domain/game/engine';
import type { GameAction, RoleId } from '../../domain/game/types';
import { formatMessage, translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

type Kind = 'challenge' | 'block' | 'pass';

type ReactPromptProps = {
  action: GameAction;
  actorName: string;
  timeoutMs: number;
  humanRoles: RoleId[];
  onReact: (kind: Kind, blockRole?: RoleId) => void;
};

const blockingRoles = (action: GameAction): RoleId[] => {
  if (action.type === 'fundRaise') return ['leader'];
  if (action.type === 'steal') return ['helper'];
  if (action.type === 'attack') return ['reporter'];
  return [];
};

export const ReactPrompt = ({ action, actorName, timeoutMs, humanRoles, onReact }: ReactPromptProps) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const [remaining, setRemaining] = useState(timeoutMs);
  const [paused, setPaused] = useState(false);
  const challengeRole = requiredRoleForAction(action.type);
  const legalBlocks = useMemo(() => blockingRoles(action), [action]);
  const timed = timeoutMs > 0;
  const progress = timed ? Math.max(0, Math.min(1, remaining / timeoutMs)) : 1;
  const secondsLeft = Math.ceil(remaining / 1000);

  useEffect(() => {
    setRemaining(timeoutMs);
  }, [action, timeoutMs]);

  useEffect(() => {
    if (paused || !timed) return undefined;
    const interval = window.setInterval(() => {
      setRemaining((value) => {
        const next = value - 100;
        if (next <= 0) {
          window.clearInterval(interval);
          onReact('pass');
          return 0;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [onReact, paused, timed]);

  return (
    <div className="bottom-sheet surface-strong grid gap-3 rounded-t-2xl border px-3 py-3 shadow-card sm:rounded-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brass">{t.common.react}</p>
          <h3 className="sr-only">{t.common.actionPanelTitle}</h3>
          <h3 className="font-display text-lg font-black">{t.common.reactPrompt}</h3>
          <p className="text-app-muted truncate text-xs">
            {actorName} · {t.actions[action.type]}
          </p>
        </div>
        {timed ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? t.common.resumeTimer : t.common.pauseTimer}
              className="surface-control grid h-9 w-9 place-items-center rounded-full border"
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <div
              className="grid h-14 w-14 place-items-center rounded-full text-xs font-black text-brass shadow-gold"
              style={{
                background: `conic-gradient(#d6a651 ${progress * 360}deg, rgba(154,111,44,0.18) 0deg)`,
              }}
              aria-label={`${secondsLeft} seconds left`}
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--surface-strong)] leading-none">
                <Timer size={12} className="mb-0.5 opacity-70" />
                <span className="-mt-1 font-display text-base font-black">{secondsLeft}</span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
        {challengeRole ? (
          <button
            type="button"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onClick={() => onReact('challenge')}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ember bg-danger px-4 py-2.5 font-display text-sm font-black uppercase tracking-widest shadow-chipDanger transition hover:brightness-110"
          >
            <ShieldAlert size={17} />
            {t.common.challengeAction}
          </button>
        ) : null}

        {legalBlocks.length > 0
          ? legalBlocks.map((role) => {
            const inHand = humanRoles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onClick={() => onReact('block', role)}
                className="surface-control inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brass/70 px-4 py-2.5 font-display text-sm font-black transition hover:bg-[var(--control-hover)]"
              >
                <Shield size={16} className="text-brass" />
                {formatMessage(t.common.blockAs, { role: t.roles[role].name })}
                {inHand ? (
                  <span className="rounded-full bg-brass/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-brass">
                    {t.common.inHand}
                  </span>
                ) : null}
              </button>
            );
          })
          : null}

        <button
          type="button"
          onClick={() => onReact('pass')}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-token bg-success px-4 py-2.5 font-display text-sm font-black uppercase tracking-widest text-white transition hover:brightness-110"
        >
          <CheckCircle2 size={17} />
          {t.common.pass}
        </button>
      </div>
    </div>
  );
};
