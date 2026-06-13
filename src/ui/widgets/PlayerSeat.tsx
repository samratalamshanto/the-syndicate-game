import { CircleDollarSign, Skull, Target, User } from 'lucide-react';
import type { Ref } from 'react';
import type { PlayerSummaryView } from '../../domain/game/types';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { getPersona } from '../../config/botPersonas';
import { GameCard } from './GameCard';

type Props = {
  player: PlayerSummaryView;
  isActive?: boolean;
  isTargetable?: boolean;
  isThinking?: boolean;
  isShaking?: boolean;
  flavorLine?: string | null;
  density?: 'normal' | 'compact';
  variant?: 'table' | 'phone' | 'felt';
  className?: string;
  coinRef?: Ref<HTMLDivElement>;
  onSelectTarget?: (playerId: string) => void;
  compact?: boolean;
  /** Ultra-compact badge (avatar + name + money + card pips) for the landscape board. */
  mini?: boolean;
};

export const PlayerSeat = ({
  player,
  isActive = false,
  isTargetable = false,
  isThinking = false,
  isShaking = false,
  flavorLine = null,
  density = 'normal',
  variant = 'table',
  className = '',
  coinRef,
  onSelectTarget,
  compact = true,
  mini = false,
}: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const canSelect = isTargetable && !player.isEliminated;
  const isHuman = player.kind === 'human';
  const persona = getPersona(player.personaId);
  const isPhone = variant === 'phone';
  const isFelt = variant === 'felt';
  const cardSize = isPhone || density === 'compact' || isFelt ? 'xs' : compact ? 'sm' : 'md';
  const initials = persona ? persona.name.slice(0, 2).toUpperCase() : '';
  const seedHash = persona ? djb2(persona.avatarSeed) : 0;
  const hue = (seedHash * 137) % 360;
  const panelPadding = mini ? 'px-2 py-1' : isPhone || density === 'compact' || isFelt ? 'px-2 py-1.5' : 'px-3 py-2.5';

  const cards = player.cards
    ? player.cards.filter((c) => c.status === 'alive').map((card) => (
        <GameCard key={card.id} variant="face" role={card.role} size={cardSize} />
      ))
    : Array.from({ length: player.aliveCards }).map((_, index) => (
        <GameCard key={`${player.id}-back-${index}`} variant="back" size={cardSize} />
      ));

  const revealed = player.revealedRoles.map((role, index) => (
    <GameCard key={`${player.id}-dead-${role}-${index}`} variant="dead" role={role} size={cardSize} />
  ));

  const stateClasses = player.isEliminated
    ? 'opacity-50 grayscale'
    : isActive
      ? 'scale-[1.04]'
      : '';

  const wrapperClasses = `relative ${stateClasses} ${canSelect ? 'reticle' : ''} ${isShaking ? 'target-shake' : ''} ${className}`;
  const seatSurface = isFelt
    ? 'felt-seat relative grid gap-1.5 rounded-2xl border'
    : 'surface-glass relative grid gap-2 rounded-2xl border backdrop-blur-sm';

  const inner = (
    <div className={`${seatSurface} ${panelPadding} ${isActive && !player.isEliminated ? 'border-2 border-brass' : 'border-token'}`}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`relative grid shrink-0 place-items-center rounded-full border border-token font-display font-black ${
              isFelt ? 'h-7 w-7 text-[11px]' : 'h-9 w-9 text-sm'
            } ${
              isHuman ? 'bg-brass text-night' : persona ? 'text-white' : 'text-app'
            }`}
            style={
              persona
                ? {
                    background: `linear-gradient(135deg, hsl(${hue} 60% 35%), hsl(${(hue + 40) % 360} 70% 25%))`,
                  }
                : undefined
            }
          >
            {isHuman ? <User size={isFelt ? 12 : 15} /> : initials}
            {player.isEliminated ? (
              <span className="absolute -right-2 -top-2 rounded-full bg-alert px-1.5 py-0.5 text-[10px] font-black uppercase text-white">
                out
              </span>
            ) : null}
          </span>
          <div className="min-w-0 leading-tight">
            <p className={`max-w-full truncate rounded-full px-2 py-0.5 font-display font-black ${isActive && !player.isEliminated ? 'bg-brass text-night' : ''} ${isFelt ? 'text-xs' : 'text-sm'}`}>{player.name}</p>
            {density === 'compact' || isPhone || mini ? null : (
              <p className="text-app-muted text-[10px] uppercase tracking-widest">
                {isHuman ? t.common.humanLabel : persona ? t.bot.style[persona.style] : 'Bot'}
                {player.isEliminated ? ' · out' : ''}
              </p>
            )}
          </div>
        </div>
        <div ref={coinRef} className={`surface-control flex min-w-0 shrink-0 items-center gap-1 rounded-full border font-black ${player.money === null ? 'px-1.5 py-1' : isFelt ? 'max-w-[5.25rem] px-1 py-0.5 text-[10px]' : 'max-w-[5.25rem] px-2 py-1 text-[11px]'}`} aria-label={player.money === null ? t.common.hidden : `${player.money} coins`}>
          <span className={`relative grid place-items-center rounded-full border border-token-soft bg-[var(--surface-muted)] ${isFelt ? 'h-4 w-4' : 'h-5 w-5'}`}>
            <span className="absolute inset-[3px] rounded-full border border-night/25" />
            <CircleDollarSign size={isFelt ? 10 : 12} className="relative text-brass" />
          </span>
          {player.money !== null ? (
            <>
              <span className="font-mono tabular-nums text-app">{player.money}</span>
              <span className="truncate text-app-muted">coins</span>
            </>
          ) : (
            <span className="sr-only">{t.common.hidden}</span>
          )}
        </div>
      </div>

      <div className={`flex flex-wrap gap-1.5 ${isFelt || mini ? 'justify-center' : ''}`}>
        {player.isEliminated ? (
          <div className="flex items-center gap-1 rounded-md bg-ember/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-ember">
            <Skull size={12} /> out
          </div>
        ) : mini ? (
          <div className="flex items-center gap-1">
            {Array.from({ length: player.aliveCards }).map((_, index) => (
              <span key={`pip-${index}`} className="h-3.5 w-2.5 rounded-[3px] border border-brass/50 bg-[var(--surface-muted)]" />
            ))}
            {player.revealedRoles.map((_, index) => (
              <span key={`pip-dead-${index}`} className="h-3.5 w-2.5 rounded-[3px] bg-alert/70" />
            ))}
          </div>
        ) : (
          <>
            {cards}
            {revealed}
          </>
        )}
      </div>

      {canSelect ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-alert px-2 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-chipDanger">
          <Target size={11} />
          {t.common.chooseTarget}
        </div>
      ) : null}
      {isThinking && !player.isEliminated ? (
        <div className="thinking-surface absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border px-2 py-1 text-xs font-black text-success">
          <span>{player.name} {t.common.thinking}</span>
          <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
          <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
          <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
        </div>
      ) : null}
      {isActive && !player.isEliminated ? (
        <div className="absolute -top-3 right-3 inline-flex items-center gap-1 rounded-full bg-brass px-2 py-0.5 text-xs font-black uppercase text-night">
          turn
        </div>
      ) : null}
    </div>
  );

  return canSelect ? (
    <button
      type="button"
      onClick={() => onSelectTarget?.(player.id)}
      className={`block min-h-[56px] w-full text-left ${isPhone ? 'min-w-[180px] max-w-[220px] snap-start' : ''} ${wrapperClasses}`}
    >
      {inner}
    </button>
  ) : (
    <div className={`${isPhone ? 'min-w-[180px] max-w-[220px] snap-start' : ''} ${wrapperClasses}`}>{inner}</div>
  );
};

const djb2 = (value: string) =>
  value.split('').reduce((hash, char) => ((hash << 5) + hash + char.charCodeAt(0)) >>> 0, 5381);
