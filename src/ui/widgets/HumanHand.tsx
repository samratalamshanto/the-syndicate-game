import { CircleDollarSign, RefreshCcw, User } from 'lucide-react';
import { useState } from 'react';
import type { Ref } from 'react';
import type { PlayerSummaryView } from '../../domain/game/types';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { GameCard } from './GameCard';
import { useMediaQuery } from '../hooks/useMediaQuery';

type Props = {
  player: PlayerSummaryView;
  isActive: boolean;
  flash?: boolean;
  coinRef?: Ref<HTMLDivElement>;
  onNewGame: () => void;
  onBackToSetup: () => void;
};

export const HumanHand = ({ player, isActive, flash = false, coinRef, onNewGame, onBackToSetup }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 640px)');

  const cards = player.cards ?? [];
  const cardSize = isDesktop ? 'lg' : 'sm';

  return (
    <section
      aria-label={t.common.yourHand}
      className={`surface-glass relative grid gap-2 rounded-2xl border px-3 py-2 backdrop-blur-sm transition sm:gap-3 sm:px-4 sm:py-3 ${
        isActive ? 'border-brass shadow-spotlight' : 'border-brass/30'
      } ${flash ? 'human-turn-flash' : ''} ${player.aliveCards === 1 ? 'animate-pulseRed' : ''}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brass text-night shadow sm:h-10 sm:w-10">
              <User size={18} />
            </span>
            <div className="leading-tight">
            <h3 className="font-display text-lg font-black sm:text-xl">{t.common.yourHand}</h3>
            <p className="text-app-muted text-[11px] uppercase tracking-widest">{player.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div ref={coinRef} className="flex items-center gap-1.5 rounded-full border border-brass/60 bg-gradient-to-r from-[#2b1b08] via-[#8a5b16] to-[#f1c15a] px-2.5 py-1 text-night shadow-gold sm:gap-2 sm:px-3 sm:py-1.5">
            <span className="relative grid h-7 w-7 place-items-center rounded-full border border-white/45 bg-gradient-to-br from-[#fff2a8] via-[#d69b25] to-[#6c3f08] shadow sm:h-8 sm:w-8">
              <span className="absolute inset-1 rounded-full border border-night/30" />
              <CircleDollarSign size={18} className="relative text-night" />
            </span>
            <span className="font-display text-sm font-black sm:text-base">
              {player.money}<span className="text-night/65">/10</span>
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
            className="surface-control inline-flex min-h-11 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold sm:min-h-0"
          >
            <RefreshCcw size={13} />
            {t.common.newGame}
          </button>
        </div>
      </div>

      {confirmOpen ? (
        <div className="surface-strong grid gap-2 rounded-xl border border-token px-3 py-3 shadow-card">
          <p className="font-display text-sm font-black">{t.common.startNewGame}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirmOpen(false);
                onNewGame();
              }}
              className="min-h-11 rounded-full bg-brass px-3 py-2 text-xs font-black text-night"
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
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="surface-control min-h-11 rounded-full border px-3 py-2 text-xs font-black"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-nowrap items-end gap-2 overflow-x-auto scroll-tight pb-1 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:pb-0">
        {cards.length === 0 ? (
          <p className="text-app-muted text-sm">—</p>
        ) : (
          cards.map((card, index) =>
            card.status === 'alive' ? (
              <div
                key={card.id}
                className="origin-bottom"
                style={{
                  transform: isDesktop
                    ? `rotate(${(index - (cards.length - 1) / 2) * 4}deg) translateY(${
                        Math.abs(index - (cards.length - 1) / 2) * 4
                      }px)`
                    : 'none',
                }}
              >
                <GameCard variant="face" role={card.role} size={cardSize} />
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
