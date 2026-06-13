import type { RoleId } from '../../domain/game/types';
import { roleColors } from '../../config/branding';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { RolePortrait } from './RolePortrait';

type Size = 'xs' | 'sm' | 'md' | 'lg';

const sizeClasses: Record<Size, string> = {
  xs: 'w-12 sm:w-14',
  sm: 'w-16 sm:w-20',
  md: 'w-24 sm:w-28',
  lg: 'w-32 sm:w-40',
};

type FaceProps = {
  variant: 'face';
  role: RoleId;
  size?: Size;
  fresh?: boolean;
  freshDelayMs?: number;
  yours?: boolean;
};

type BackProps = {
  variant: 'back';
  size?: Size;
  fresh?: boolean;
  freshDelayMs?: number;
};

type DeadProps = {
  variant: 'dead';
  role: RoleId;
  size?: Size;
  fresh?: boolean;
  freshDelayMs?: number;
};

type Props = FaceProps | BackProps | DeadProps;

export const GameCard = (props: Props) => {
  const size = props.size ?? 'md';
  const language = useGameStore((state) => state.language);
  const theme = useGameStore((state) => state.theme);
  const t = translations[language];
  const frameClass = `relative ${sizeClasses[size]} aspect-[3/4] rounded-xl transition-transform hover:-translate-y-1 ${props.fresh ? 'animate-cardDeal' : ''}`;
  const frameStyle = props.freshDelayMs !== undefined ? { animationDelay: `${props.freshDelayMs}ms` } : undefined;
  const cardBackClass = theme === 'dark' ? 'card-back-pattern' : 'card-back-pattern-light';

  if (props.variant === 'back') {
    return (
      <div className={`${frameClass} rounded-xl border border-brass/70 bg-[#efe1b8] p-1 shadow-card`} style={frameStyle}>
        <div className={`${cardBackClass} h-full w-full rounded-lg border border-brass/50 shadow-innerGold`}>
          <div className="absolute inset-2 rounded-md border border-brass/35" />
        </div>
      </div>
    );
  }

  if (props.variant === 'dead') {
    const copy = t.roles[props.role];
    return (
      <div className={`${frameClass} surface-strong overflow-hidden border border-token grayscale`} style={frameStyle}>
        <div className="absolute inset-x-0 top-0 h-1 bg-alert" />
        <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-alert px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
          {t.common.revealed}
        </span>
        <div className="absolute inset-0 grid grid-rows-[1fr_auto] gap-1 p-2 text-center">
          <div className="relative mt-5 grid place-items-center">
            <RolePortrait role={props.role} fill />
          </div>
          <div className="rounded-md bg-[var(--surface-muted)] px-1 py-1 font-display text-[10px] sm:text-xs font-black text-app">
            {copy.name}
          </div>
        </div>
      </div>
    );
  }

  const copy = t.roles[props.role];
  // Larger cards (hand, choice prompts, desktop) carry the ability text so players can
  // read what a role does without opening the guide. Tiny cards stay name-only.
  const showAbility = size === 'md' || size === 'lg';

  return (
    <div className={`${frameClass} surface-strong overflow-hidden border border-token`} style={frameStyle}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${roleColors[props.role]}`} />
      <div className="absolute inset-0 flex flex-col gap-1 p-1.5 pt-2">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-md border border-token-soft bg-[var(--surface-muted)]">
          <RolePortrait role={props.role} fill />
        </div>
        <div className="rounded-md bg-[var(--surface-muted)] px-1.5 py-1 text-center">
          <p className="font-display text-[11px] font-black leading-tight text-app sm:text-sm">{copy.name}</p>
          {showAbility ? (
            <>
              <p className="mt-0.5 text-[10px] font-bold leading-snug text-app sm:text-[11px]">{copy.power}</p>
              <p className="text-[10px] font-semibold leading-snug text-app-muted sm:text-[11px]">{copy.counter}</p>
            </>
          ) : null}
        </div>
      </div>
      {props.yours ? <div className="absolute inset-x-2 bottom-0 h-0.5 bg-brass" /> : null}
    </div>
  );
};
