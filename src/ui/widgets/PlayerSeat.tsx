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
  variant?: 'table' | 'phone';
  coinRef?: Ref<HTMLDivElement>;
  onSelectTarget?: (playerId: string) => void;
  compact?: boolean;
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
  coinRef,
  onSelectTarget,
  compact = true,
}: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const canSelect = isTargetable && !player.isEliminated;
  const isHuman = player.kind === 'human';
  const persona = getPersona(player.personaId);
  const isPhone = variant === 'phone';
  const cardSize = isPhone || density === 'compact' ? 'xs' : compact ? 'sm' : 'md';
  const initials = persona ? persona.name.slice(0, 2).toUpperCase() : '';
  const seedHash = persona ? djb2(persona.avatarSeed) : 0;
  const hue = (seedHash * 137) % 360;
  const panelPadding = isPhone || density === 'compact' ? 'px-2 py-1.5' : 'px-3 py-2.5';

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
    ? 'opacity-45 grayscale'
    : !isHuman && player.aliveCards === 1
      ? 'animate-pulseGold'
    : isActive
      ? 'shadow-spotlight'
      : '';

  const wrapperClasses = `relative ${stateClasses} ${canSelect ? 'reticle' : ''} ${isShaking ? 'target-shake' : ''}`;

  const inner = (
    <div className={`surface-glass relative grid gap-2 rounded-2xl border ${panelPadding} backdrop-blur-sm`}>
      {isActive && !player.isEliminated ? (
        <div className="pointer-events-none absolute -inset-1 -z-10 rounded-3xl seat-spotlight animate-spotlightSweep" />
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brass/40 font-display text-sm font-black ${
              isHuman ? 'bg-brass text-night' : 'text-paper'
            }`}
            style={
              persona
                ? {
                    background: `linear-gradient(135deg, hsl(${hue} 60% 35%), hsl(${(hue + 40) % 360} 70% 25%))`,
                  }
                : undefined
            }
          >
            {isHuman ? <User size={15} /> : initials}
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-black">{player.name}</p>
            {density === 'compact' || isPhone ? null : (
              <p className="text-app-muted text-[10px] uppercase tracking-widest">
                {isHuman ? 'You' : persona ? t.bot.style[persona.style] : 'Bot'}
                {player.isEliminated ? ' · out' : ''}
              </p>
            )}
          </div>
        </div>
        <div ref={coinRef} className="flex items-center gap-1.5 rounded-full border border-brass/55 bg-gradient-to-r from-[#2b1b08] via-[#845611] to-[#e4b84d] px-2 py-1 text-[11px] font-black text-night shadow-sm">
          <span className="relative grid h-5 w-5 place-items-center rounded-full border border-white/40 bg-gradient-to-br from-[#fff2a8] via-[#d69b25] to-[#6c3f08]">
            <span className="absolute inset-[3px] rounded-full border border-night/25" />
            <CircleDollarSign size={12} className="relative text-night" />
          </span>
          <span className={player.money !== null ? 'text-night' : 'text-night/65'}>
            {player.money !== null ? `${player.money}` : t.common.hidden}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {player.isEliminated ? (
          <div className="flex items-center gap-1 rounded-md bg-ember/15 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-ember">
            <Skull size={12} /> out
          </div>
        ) : (
          <>
            {cards}
            {revealed}
          </>
        )}
      </div>

      {canSelect ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-ember px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-paper shadow-chipDanger">
          <Target size={11} />
          {t.common.chooseTarget}
        </div>
      ) : null}
      {isThinking && !player.isEliminated ? (
        <div className="absolute -bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-brass/45 bg-night/90 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-paper shadow-gold">
          <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-brass" />
          <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-brass" />
          <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-brass" />
        </div>
      ) : null}
      {flavorLine && !player.isEliminated ? (
        <div className="absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-brass/45 bg-night/95 px-3 py-1 text-[11px] font-black text-paper shadow-gold">
          {flavorLine}
        </div>
      ) : null}
      {isActive && !player.isEliminated ? (
        <div className="absolute -top-3 right-3 inline-flex items-center gap-1 rounded-full bg-brass px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-night animate-floatSlow">
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
