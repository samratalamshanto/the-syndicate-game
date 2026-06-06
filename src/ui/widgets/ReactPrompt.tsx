import { CheckCircle2, Shield, ShieldAlert, Timer } from 'lucide-react';
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
  const progress = Math.max(0, Math.min(1, remaining / timeoutMs));
  const secondsLeft = Math.ceil(remaining / 1000);

  useEffect(() => {
    setRemaining(timeoutMs);
  }, [action, timeoutMs]);

  useEffect(() => {
    if (paused) return undefined;
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
  }, [onReact, paused]);

  return (
    <div className="bottom-sheet surface-strong grid gap-3 rounded-t-2xl border px-3 py-3 shadow-card sm:rounded-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brass">{t.common.react}</p>
          <h3 className="sr-only">{t.common.actionPanelTitle}</h3>
          <h3 className="font-display text-lg font-black">{t.common.reactPrompt}</h3>
          <p className="text-app-muted text-xs">
            {actorName} · {t.actions[action.type]}
          </p>
        </div>
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full text-xs font-black text-brass shadow-gold"
          style={{
            background: `conic-gradient(#d6a651 ${progress * 360}deg, rgba(154,111,44,0.18) 0deg)`,
          }}
          aria-label={`${secondsLeft} seconds left`}
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--surface-strong)] leading-none">
            <Timer size={12} className="mb-0.5 opacity-70" />
            <span className="-mt-1 font-display text-lg font-black">{secondsLeft}</span>
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        {challengeRole ? (
          <button
            type="button"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onClick={() => onReact('challenge')}
            className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-ember bg-ember px-4 py-3 font-display text-base font-black uppercase tracking-widest text-paper shadow-chipDanger transition hover:brightness-110"
          >
            <ShieldAlert size={19} />
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
                className="surface-control inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-brass/70 px-4 py-3 font-display text-base font-black transition hover:bg-[var(--control-hover)]"
              >
                <Shield size={18} className="text-brass" />
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
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/60 bg-gradient-to-br from-[#d9ffe8] via-[#43c77a] to-[#11623b] px-4 py-3 font-display text-base font-black uppercase tracking-widest text-emerald-950 shadow transition hover:brightness-110"
        >
          <CheckCircle2 size={19} />
          {t.common.pass}
        </button>
      </div>
    </div>
  );
};
