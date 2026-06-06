import type { CharacterCard, PendingChoice } from '../../domain/game/types';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { GameCard } from './GameCard';

type Props = {
  cards: CharacterCard[];
  cause: Extract<NonNullable<PendingChoice>, { kind: 'revealCard' }>['cause'];
  mode: Extract<NonNullable<PendingChoice>, { kind: 'revealCard' }>['mode'];
  detail: string;
  onPick: (cardId: string) => void;
};

const causeKey: Record<Props['cause'], keyof (typeof translations)['en']['common']> = {
  challenge_lost: 'causeChallenge',
  attack: 'causeAttack',
  eliminate: 'causeEliminate',
  block_lost: 'causeBlock',
};

export const ChooseRevealPrompt = ({ cards, cause, mode, detail, onPick }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 backdrop-blur-sm sm:place-items-center">
      <div className="bottom-sheet surface-strong grid w-full max-w-lg gap-4 rounded-t-2xl border-2 border-ember px-5 py-5 text-center shadow-card sm:rounded-2xl">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-ember">{t.common.cardAtRisk}</p>
          <h3 className="font-display text-2xl font-black">
            {mode === 'returnToDeck' ? t.common.chooseLoseTitle : t.common.chooseRevealTitle}
          </h3>
          <p className="text-app-muted text-sm">{t.common[causeKey[cause]]}</p>
          <p className="mt-2 rounded-full border border-ember/40 bg-ember/15 px-3 py-1 text-sm font-black text-ember">
            {detail}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => onPick(card.id)}
              className="rounded-2xl p-1 transition duration-150 hover:scale-95 focus:outline-none focus:ring-2 focus:ring-ember"
              aria-label={`${mode === 'returnToDeck' ? t.common.chooseLoseTitle : t.common.revealed} ${t.roles[card.role].name}`}
            >
              <GameCard variant="face" role={card.role} size="lg" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
