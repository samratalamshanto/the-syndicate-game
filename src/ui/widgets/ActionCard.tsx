import { Coins, Crosshair, Hand, Shield, ShieldAlert, ShieldQuestion, Sparkles, Swords, Target, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import type { ActionType } from '../../domain/game/types';
import { requiredRoleForAction } from '../../domain/game/engine';
import { roleColors } from '../../config/branding';
import { formatMessage, translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { useMediaQuery } from '../hooks/useMediaQuery';

type Props = {
  type: ActionType;
  disabled?: boolean;
  unaffordableBy?: number;
  onSelect: (type: ActionType) => void;
};

const icons: Record<ActionType, LucideIcon> = {
  income: Hand,
  fundRaise: Coins,
  tax: Sparkles,
  exchange: ShieldQuestion,
  steal: Swords,
  attack: Crosshair,
  eliminate: Target,
};

const costs: Record<ActionType, number> = {
  income: 0,
  fundRaise: 0,
  tax: 0,
  exchange: 0,
  steal: 0,
  attack: 3,
  eliminate: 7,
};

const gains: Record<ActionType, number> = {
  income: 1,
  fundRaise: 2,
  tax: 3,
  exchange: 0,
  steal: 2,
  attack: 0,
  eliminate: 0,
};

const canChallenge: Record<ActionType, boolean> = {
  income: false,
  fundRaise: false,
  tax: true,
  exchange: true,
  steal: true,
  attack: true,
  eliminate: false,
};

const canBlock: Record<ActionType, boolean> = {
  income: false,
  fundRaise: true,
  tax: false,
  exchange: false,
  steal: true,
  attack: true,
  eliminate: false,
};

const needsTarget: Record<ActionType, boolean> = {
  income: false,
  fundRaise: false,
  tax: false,
  exchange: false,
  steal: true,
  attack: true,
  eliminate: true,
};

export const ActionCard = ({ type, disabled, unaffordableBy = 0, onSelect }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const isDesktop = useMediaQuery('(min-width: 640px)');
  const [pressed, setPressed] = useState(false);
  const [shake, setShake] = useState(false);
  const [showCostTip, setShowCostTip] = useState(false);
  const Icon = icons[type];
  const role = requiredRoleForAction(type);
  const gain = gains[type];
  const cost = costs[type];

  const headerGradient = role ? roleColors[role] : 'from-ink to-smoke';
  const helpPoints = t.actionHelp[type]
    .split('.')
    .map((point) => point.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <button
      type="button"
      aria-disabled={disabled}
      onClick={() => {
        if (disabled) {
          setShake(true);
          setShowCostTip(true);
          window.setTimeout(() => setShake(false), 160);
          window.setTimeout(() => setShowCostTip(false), 1200);
          return;
        }
        setPressed(true);
        window.setTimeout(() => onSelect(type), 60);
      }}
      onAnimationEnd={() => setPressed(false)}
      aria-label={t.actions[type]}
      className={`group surface-strong relative flex min-h-36 w-full flex-col overflow-hidden rounded-lg border border-token shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brass focus:outline-none focus:ring-2 focus:ring-brass sm:min-h-40 ${
        disabled ? 'cursor-not-allowed opacity-75 hover:-translate-y-0' : ''
      } ${
        pressed ? 'chip-drop-active' : ''
      } ${
        shake ? 'target-shake' : ''
      }`}
    >
      {showCostTip && unaffordableBy > 0 ? (
        <span className="absolute inset-x-2 bottom-9 z-20 rounded-lg bg-danger px-2 py-1 text-center text-[10px] font-black text-white shadow-chipDanger">
          {formatMessage(t.common.cantAfford, { n: unaffordableBy })}
        </span>
      ) : null}
      <div className={`relative h-9 shrink-0 sm:h-10 bg-gradient-to-br ${headerGradient}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="absolute inset-0 grid place-items-center">
          <Icon size={isDesktop ? 22 : 18} className="text-white drop-shadow" />
        </div>
        {role ? (
          <span className="surface-muted absolute right-1 top-1 rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-brass">
            {t.roles[role].name.slice(0, 4)}
          </span>
        ) : (
          <span className="absolute right-1 top-1 rounded-full bg-emerald-900/70 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-200">
            safe
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between px-3 py-2.5 text-left">
        <div>
          <p className="font-display text-[13px] font-black leading-snug text-app sm:text-sm">{t.actions[type]}</p>
          <ul className="mt-1.5 grid gap-1 text-[11px] font-semibold leading-snug text-app">
            {helpPoints.map((point) => (
              <li key={point} className="flex gap-1">
                <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-brass/80" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-1 flex items-center justify-between gap-1 text-[10px] font-bold sm:mt-2">
          <div className="flex items-center gap-1">
            {unaffordableBy > 0 ? (
              <span className="flex items-center gap-0.5 rounded-full bg-ember/20 px-1.5 py-0.5 text-ember">
                <Coins size={9} />
                {formatMessage(t.common.needCoins, { n: unaffordableBy })}
              </span>
            ) : cost > 0 ? (
              <span className="flex items-center gap-0.5 rounded-full bg-ember/20 px-1.5 py-0.5 text-ember">
                <Coins size={9} />-{cost}
              </span>
            ) : null}
            {gain > 0 ? (
              <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-emerald-300">
                <Coins size={9} />+{gain}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-0.5">
            {canChallenge[type] ? (
              <ShieldAlert size={11} className="text-brass" aria-label={t.common.canChallenge} />
            ) : null}
            {canBlock[type] ? <Shield size={11} className="text-sky-300" aria-label={t.common.canBlock} /> : null}
            {needsTarget[type] ? <Target size={11} className="text-ember" aria-label={t.common.needsTarget} /> : null}
          </div>
        </div>
      </div>
    </button>
  );
};
