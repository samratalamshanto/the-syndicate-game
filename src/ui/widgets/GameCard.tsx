import type { RoleId } from '../../domain/game/types';
import { roleColors } from '../../config/branding';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { RolePortrait } from './RolePortrait';

type Size = 'xs' | 'sm' | 'md' | 'lg';

const sizeClasses: Record<Size, string> = {
  xs: 'w-11 sm:w-12',
  sm: 'w-14 sm:w-16',
  md: 'w-20 sm:w-24',
  lg: 'w-28 sm:w-32',
};

type FaceProps = {
  variant: 'face';
  role: RoleId;
  size?: Size;
  fresh?: boolean;
};

type BackProps = {
  variant: 'back';
  size?: Size;
  fresh?: boolean;
};

type DeadProps = {
  variant: 'dead';
  role: RoleId;
  size?: Size;
  fresh?: boolean;
};

type Props = FaceProps | BackProps | DeadProps;

export const GameCard = (props: Props) => {
  const size = props.size ?? 'md';
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const frameClass = `relative ${sizeClasses[size]} aspect-[3/4] rounded-xl ${props.fresh ? 'animate-cardDeal' : ''}`;

  if (props.variant === 'back') {
    return (
      <div className={`${frameClass} card-back-pattern shadow-card`}>
        <div className="absolute inset-1.5 rounded-lg border border-brass/50" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="font-display text-lg sm:text-xl font-black tracking-widest text-brass/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
            S
          </div>
        </div>
      </div>
    );
  }

  if (props.variant === 'dead') {
    const copy = t.roles[props.role];
    return (
      <div className={`${frameClass} card-dead shadow-cardSoft`}>
        <div className="absolute inset-1.5 rounded-lg border border-ember/45" />
        <div className="absolute inset-0 grid grid-rows-[1fr_auto] gap-1 p-1.5 text-center">
          <div className="relative mt-1 grid place-items-center">
            <div className="absolute h-px w-full rotate-[-12deg] bg-ember/70" />
            <div className="font-display text-[10px] sm:text-xs font-black uppercase tracking-widest text-ember/85">
              {t.common.revealed}
            </div>
          </div>
          <div className="rounded-md bg-ember/15 px-1 py-0.5 text-[10px] sm:text-xs font-black text-ember">
            {copy.name}
          </div>
        </div>
      </div>
    );
  }

  const copy = t.roles[props.role];
  return (
    <div className={`${frameClass} overflow-hidden shadow-card ring-1 ring-brass/55`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${roleColors[props.role]}`} />
      <div className="card-face absolute inset-0" />
      <div className="absolute inset-[3px] rounded-lg ring-1 ring-white/20" />
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center justify-between px-1.5 pt-1.5">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/85 drop-shadow">
            {copy.name}
          </span>
          <span className="grid h-4 w-4 sm:h-5 sm:w-5 place-items-center rounded-full bg-brass text-[10px] font-black text-night">
            {copy.name.charAt(0)}
          </span>
        </div>
        <div className="flex-1 px-1.5">
          <div className="h-full overflow-hidden rounded-md ring-1 ring-white/15">
            <RolePortrait role={props.role} fill />
          </div>
        </div>
        <div className="mt-1 px-1.5 pb-1.5">
          <div className="gold-frame rounded-md px-1 py-0.5 text-center font-display text-[10px] sm:text-xs font-black text-night">
            {copy.name}
          </div>
        </div>
      </div>
    </div>
  );
};
