import { CircleDollarSign, RefreshCcw, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Ref } from 'react';
import type { PlayerSummaryView } from '../../domain/game/types';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { GameCard } from './GameCard';
import { Modal } from './Modal';
import { useMediaQuery } from '../hooks/useMediaQuery';

type Props = {
  player: PlayerSummaryView;
  isActive: boolean;
  flash?: boolean;
  variant?: 'panel' | 'felt';
  coinRef?: Ref<HTMLDivElement>;
  onNewGame: () => void;
  onBackToSetup: () => void;
};

export const HumanHand = ({ player, isActive, flash = false, variant = 'panel', coinRef, onNewGame, onBackToSetup }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 640px)');

  const cards = player.cards ?? [];
  const isFelt = variant === 'felt';
  const cardSize = isFelt ? 'xs' : isDesktop ? 'md' : 'sm';
  const surfaceClass = isFelt ? 'felt-human-hand' : 'surface-glass';
  const seenCardIdsRef = useRef<Set<string>>(new Set());
  const freshCardIds = useMemo(
    () => new Set(cards.filter((card) => card.status === 'alive' && !seenCardIdsRef.current.has(card.id)).map((card) => card.id)),
    [cards],
  );

  useEffect(() => {
    cards.forEach((card) => {
      if (card.status === 'alive') {
        seenCardIdsRef.current.add(card.id);
      }
    });
  }, [cards]);

  return (
    <section
      aria-label={t.common.yourHand}
      className={`${surfaceClass} relative grid rounded-2xl border px-3 py-2 backdrop-blur-sm transition ${
        isFelt ? 'gap-1.5 sm:gap-2 sm:px-3 sm:py-2' : 'gap-2 sm:gap-3 sm:px-4 sm:py-3'
      } ${
        isActive ? 'border-brass' : 'border-token'
      } ${flash ? 'human-turn-flash' : ''} ${player.aliveCards === 1 ? 'animate-pulseRed' : ''}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
            <span className={`grid place-items-center rounded-full bg-brass text-night shadow ${isFelt ? 'h-8 w-8' : 'h-9 w-9 sm:h-10 sm:w-10'}`}>
              <User size={isFelt ? 15 : 18} />
            </span>
            <div className="leading-tight">
            <h3 className={`font-display font-black ${isFelt ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'}`}>{t.common.yourHand}</h3>
            <p className="text-app-muted text-[11px] uppercase tracking-widest">{player.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div ref={coinRef} className={`surface-control flex items-center gap-1.5 rounded-full border shadow ${isFelt ? 'px-2 py-0.5' : 'px-2.5 py-1 sm:gap-2 sm:px-3 sm:py-1.5'}`}>
            <span className={`relative grid place-items-center rounded-full border border-token-soft bg-[var(--surface-muted)] ${isFelt ? 'h-6 w-6' : 'h-7 w-7 sm:h-8 sm:w-8'}`}>
              <span className="absolute inset-1 rounded-full border border-token-soft" />
              <CircleDollarSign size={isFelt ? 14 : 18} className="relative text-brass" />
            </span>
            <span className={`font-mono font-black tabular-nums text-app ${isFelt ? 'text-xs' : 'text-sm sm:text-base'}`}>
              {player.money}<span className="text-app-muted">/10</span>
            </span>
          </div>
          {player.aliveCards === 1 ? (
            <span className="rounded-full border border-ember bg-ember/15 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-ember">
              {t.common.lastCard}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className={`surface-control inline-flex items-center gap-1 rounded-full border text-xs font-bold ${isFelt ? 'min-h-8 px-2 py-1' : 'min-h-11 px-3 py-1.5 sm:min-h-0'}`}
          >
            <RefreshCcw size={13} />
            <span className={isFelt ? 'hidden sm:inline' : ''}>{t.common.newGame}</span>
          </button>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t.common.startNewGame}
        icon={<RefreshCcw size={18} />}
        size="sm"
        actions={
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                onNewGame();
              }}
              className="min-h-11 rounded-full bg-accent px-3 py-2 text-xs font-black"
            >
              {t.common.sameSettings}
            </button>
            <button
              type="button"
              onClick={onBackToSetup}
              className="surface-control min-h-11 rounded-full border px-3 py-2 text-xs font-black"
            >
              {t.common.changeSettings}
            </button>
          </div>
        }
      >
        <p className="text-app-muted text-sm">
          {t.common.sameSettings} / {t.common.changeSettings}
        </p>
      </Modal>

      <div className={`flex flex-nowrap items-end gap-2 overflow-x-auto scroll-tight pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0 ${isFelt ? 'sm:justify-center sm:gap-2' : 'sm:gap-3'}`}>
        {cards.length === 0 ? (
          <p className="text-app-muted text-sm">—</p>
        ) : (
          cards.map((card, index) =>
            card.status === 'alive' ? (
              <div
                key={card.id}
                className="origin-bottom"
                style={{
                  transform: isDesktop && !isFelt
                    ? `rotate(${(index - (cards.length - 1) / 2) * 4}deg) translateY(${
                        Math.abs(index - (cards.length - 1) / 2) * 4
                      }px)`
                    : 'none',
                }}
              >
                <GameCard variant="face" role={card.role} size={cardSize} fresh={freshCardIds.has(card.id)} freshDelayMs={index * 70} yours />
              </div>
            ) : (
              <GameCard key={card.id} variant="dead" role={card.role} size={cardSize} />
            ),
          )
        )}
      </div>
    </section>
  );
};
