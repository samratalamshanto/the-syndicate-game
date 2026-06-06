import { CheckCircle2, Pause, Play, Shield, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { requiredRoleForAction } from '../../domain/game/engine';
import type { GameAction, RoleId } from '../../domain/game/types';
import { translations } from '../../i18n/translations';
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
    <div className="action-pad mx-auto grid w-full max-w-3xl gap-3 rounded-2xl border px-3 py-3 sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brass">{actorName}</p>
          <h3 className="sr-only">{t.common.actionPanelTitle}</h3>
          <h3 className="font-display text-lg font-black">{t.actions[action.type]}</h3>
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
              className="grid h-11 w-11 place-items-center rounded-full text-xs font-black text-brass shadow-gold"
              style={{
                background: `conic-gradient(#d6a651 ${progress * 360}deg, rgba(154,111,44,0.18) 0deg)`,
              }}
              aria-label={`${secondsLeft} seconds left`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-strong)] leading-none">
                <span className="font-display text-sm font-black">{secondsLeft}</span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
        {challengeRole ? (
          <button
            type="button"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onClick={() => onReact('challenge')}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ember bg-alert px-4 py-2 font-display text-sm font-black shadow-chipDanger transition hover:brightness-110"
          >
            <ShieldAlert size={17} />
            {t.common.challenge}
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
                className="action-choice inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 font-display text-sm font-black transition"
              >
                <Shield size={16} className="text-brass" />
                {t.roles[role].name}
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
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-token bg-success px-4 py-2 font-display text-sm font-black text-white transition hover:brightness-110"
        >
          <CheckCircle2 size={17} />
          {t.common.pass}
        </button>
      </div>
    </div>
  );
};
