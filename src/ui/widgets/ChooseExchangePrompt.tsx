import { Check } from 'lucide-react';
import { useState } from 'react';
import type { CharacterCard } from '../../domain/game/types';
import { formatMessage, translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { GameCard } from './GameCard';

type Props = {
  alive: CharacterCard[];
  offered: CharacterCard[];
  onConfirm: (keepCardIds: string[]) => void;
};

export const ChooseExchangePrompt = ({ alive, offered, onConfirm }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const [selected, setSelected] = useState<string[]>(alive.map((card) => card.id));
  const required = alive.length;
  const selectedSet = new Set(selected);

  const toggle = (cardId: string) => {
    setSelected((current) =>
      current.includes(cardId)
        ? current.filter((id) => id !== cardId)
        : current.length < required
          ? [...current, cardId]
          : [...current.slice(1), cardId],
    );
  };

  const renderCard = (card: CharacterCard) => {
    const isSelected = selectedSet.has(card.id);
    return (
      <button
        key={card.id}
        type="button"
        onClick={() => toggle(card.id)}
        className={`relative rounded-2xl p-1 transition focus:outline-none focus:ring-2 focus:ring-brass ${
          isSelected ? 'scale-95 bg-brass/20 ring-2 ring-brass' : 'hover:bg-white/10'
        }`}
        aria-label={`${t.roles[card.role].name} ${isSelected ? t.common.selected : t.common.notSelected}`}
      >
        <GameCard variant="face" role={card.role} size="md" />
        {isSelected ? (
          <span className="absolute right-0 top-0 grid h-7 w-7 place-items-center rounded-full bg-brass text-night shadow-gold">
            <Check size={16} />
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 backdrop-blur-sm sm:place-items-center">
      <div className="bottom-sheet surface-strong grid max-h-[92dvh] w-full max-w-2xl gap-4 overflow-auto rounded-t-2xl border-2 border-brass px-5 py-5 shadow-card sm:rounded-2xl">
        <div className="text-center">
          <h3 className="font-display text-2xl font-black gold-text">{t.common.chooseExchangeTitle}</h3>
          <p className="text-app-muted text-sm">{formatMessage(t.common.chooseExchangeHelp, { n: required })}</p>
        </div>
        <div className="grid gap-3">
          <div className="rounded-xl border border-token-soft px-3 py-3">
            <p className="mb-2 font-display text-sm font-black">{t.common.yourHand}</p>
            <div className="flex flex-wrap justify-center gap-3">{alive.map(renderCard)}</div>
          </div>
          <div className="rounded-xl border border-brass/60 px-3 py-3">
            <p className="mb-2 font-display text-sm font-black text-brass">{t.common.fromDeck}</p>
            <div className="flex flex-wrap justify-center gap-3">{offered.map(renderCard)}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-app-muted text-sm font-bold">
            {formatMessage(t.common.selectedCount, { n: selected.length, total: required })}
          </p>
          <button
            type="button"
            disabled={selected.length !== required}
            onClick={() => onConfirm(selected)}
            className="min-h-11 rounded-full bg-brass px-5 py-2 font-display font-black text-night disabled:opacity-40"
          >
            {t.common.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
