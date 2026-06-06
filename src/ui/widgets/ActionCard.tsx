import { Coins, Crosshair, Hand, Shield, ShieldAlert, ShieldQuestion, Sparkles, Swords, Target, type LucideIcon } from 'lucide-react';
import type { ActionType, RoleId } from '../../domain/game/types';
import { requiredRoleForAction } from '../../domain/game/engine';
import { roleColors } from '../../config/branding';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { useMediaQuery } from '../hooks/useMediaQuery';

type Props = {
  type: ActionType;
  disabled?: boolean;
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

const roleAccent: Record<RoleId, string> = {
  leader: 'from-sky-500 to-blue-800',
  officer: 'from-red-500 to-red-900',
  thief: 'from-cyan-500 to-teal-900',
  helper: 'from-lime-400 to-emerald-900',
  reporter: 'from-amber-400 to-orange-700',
};

export const ActionCard = ({ type, disabled, onSelect }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const isDesktop = useMediaQuery('(min-width: 640px)');
  const Icon = icons[type];
  const role = requiredRoleForAction(type);
  const gain = gains[type];
  const cost = costs[type];

  const headerGradient = role ? roleColors[role] : 'from-ink to-smoke';
  const helpPoints = t.actionHelp[type]
    .split('.')
    .map((point) => point.trim())
    .filter(Boolean)
    .slice(0, isDesktop ? 2 : 1);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(type)}
      aria-label={t.actions[type]}
      className="group relative flex h-32 min-w-[106px] w-[32vw] max-w-[124px] flex-col overflow-hidden rounded-xl border border-brass/55 bg-gradient-to-b from-[#121922] to-[#05080c] text-paper shadow-card transition-all duration-200 hover:-translate-y-2 hover:border-brass hover:shadow-gold focus:outline-none focus:ring-2 focus:ring-brass disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:-translate-y-0 sm:aspect-[2/3] sm:h-auto sm:w-36 sm:max-w-[142px]"
    >
      <div className={`relative h-9 shrink-0 sm:h-14 bg-gradient-to-br ${headerGradient}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="absolute inset-0 grid place-items-center">
          <Icon size={isDesktop ? 22 : 18} className="text-white drop-shadow" />
        </div>
        {role ? (
          <span className="absolute right-1 top-1 rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-brass">
            {t.roles[role].name.slice(0, 4)}
          </span>
        ) : (
          <span className="absolute right-1 top-1 rounded-full bg-emerald-900/70 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-200">
            safe
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between px-2 py-1.5 text-left sm:px-2.5 sm:py-2">
        <div>
          <p className="line-clamp-2 font-display text-[11px] font-black leading-tight text-paper sm:text-[13px]">{t.actions[type]}</p>
          <ul className="mt-1 grid gap-0.5 text-[9px] font-semibold leading-tight text-paper/85 sm:text-[10px] sm:leading-snug">
            {helpPoints.map((point) => (
              <li key={point} className="flex gap-1">
                <span className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-brass/80" />
                <span className="line-clamp-2">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-1 flex items-center justify-between gap-1 text-[10px] font-bold sm:mt-2">
          <div className="flex items-center gap-1">
            {cost > 0 ? (
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
