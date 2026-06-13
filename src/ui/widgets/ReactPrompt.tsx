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
  /** Tighter sizing for the short landscape board. */
  compact?: boolean;
};

const blockingRoles = (action: GameAction): RoleId[] => {
  if (action.type === 'fundRaise') return ['leader'];
  if (action.type === 'steal') return ['helper'];
  if (action.type === 'attack') return ['reporter'];
  return [];
};

export const ReactPrompt = ({ action, actorName, timeoutMs, humanRoles, onReact, compact = false }: ReactPromptProps) => {
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

  const iconSize = compact ? 14 : 17;
  const btnClass = `inline-flex items-center justify-center gap-1.5 rounded-xl border font-display font-black transition ${
    compact ? 'min-h-9 px-2.5 py-1.5 text-xs' : 'min-h-11 px-4 py-2 text-sm'
  }`;

  return (
    <div
      className={`action-pad mx-auto grid w-full max-w-3xl rounded-2xl border ${
        compact ? 'gap-1.5 px-2.5 py-2' : 'gap-3 px-3 py-3 sm:px-4'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className={`font-black uppercase tracking-[0.22em] text-brass ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{actorName}</p>
          <h3 className="sr-only">{t.common.actionPanelTitle}</h3>
          <h3 className={`font-display font-black ${compact ? 'text-sm leading-tight' : 'text-lg'}`}>{t.actions[action.type]}</h3>
        </div>
        {timed ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? t.common.resumeTimer : t.common.pauseTimer}
              className={`surface-control grid place-items-center rounded-full border ${compact ? 'h-7 w-7' : 'h-9 w-9'}`}
            >
              {paused ? <Play size={compact ? 12 : 14} /> : <Pause size={compact ? 12 : 14} />}
            </button>
            <div
              className={`grid place-items-center rounded-full text-xs font-black text-brass shadow-gold ${compact ? 'h-8 w-8' : 'h-11 w-11'}`}
              style={{
                background: `conic-gradient(#d6a651 ${progress * 360}deg, rgba(154,111,44,0.18) 0deg)`,
              }}
              aria-label={`${secondsLeft} seconds left`}
            >
              <span className={`grid place-items-center rounded-full bg-[var(--surface-strong)] leading-none ${compact ? 'h-6 w-6' : 'h-8 w-8'}`}>
                <span className={`font-display font-black ${compact ? 'text-xs' : 'text-sm'}`}>{secondsLeft}</span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className={`grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] ${compact ? 'gap-1.5' : 'gap-2'}`}>
        {challengeRole ? (
          <button
            type="button"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onClick={() => onReact('challenge')}
            className={`${btnClass} border-ember bg-alert shadow-chipDanger hover:brightness-110`}
          >
            <ShieldAlert size={iconSize} />
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
                className={`action-choice ${btnClass}`}
              >
                <Shield size={compact ? 13 : 16} className="text-brass" />
                {t.roles[role].name}
                {inHand && !compact ? (
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
          className={`${btnClass} border-token bg-success text-white hover:brightness-110`}
        >
          <CheckCircle2 size={iconSize} />
          {t.common.pass}
        </button>
      </div>
    </div>
  );
};
