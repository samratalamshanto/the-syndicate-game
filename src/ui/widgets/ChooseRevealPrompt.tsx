import type { CharacterCard, PendingChoice } from '../../domain/game/types';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { GameCard } from './GameCard';
import { Modal } from './Modal';

type Props = {
  cards: CharacterCard[];
  cause: Extract<NonNullable<PendingChoice>, { kind: 'revealCard' }>['cause'];
  mode: Extract<NonNullable<PendingChoice>, { kind: 'revealCard' }>['mode'];
  detail: string;
  onPick: (cardId: string) => void;
};

type CauseTextKey = 'causeChallenge' | 'causeAttack' | 'causeEliminate' | 'causeBlock';

const causeKey: Record<Props['cause'], CauseTextKey> = {
  challenge_lost: 'causeChallenge',
  attack: 'causeAttack',
  eliminate: 'causeEliminate',
  block_lost: 'causeBlock',
};

export const ChooseRevealPrompt = ({ cards, cause, mode, detail, onPick }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];

  return (
    <Modal
      open
      onClose={() => {}}
      dismissible={false}
      title={mode === 'returnToDeck' ? t.common.chooseLoseTitle : t.common.chooseRevealTitle}
      subtitle={t.common[causeKey[cause]]}
      size="sm"
    >
      <div className="grid gap-4 text-center">
        <p className="rounded-full border border-ember/40 bg-ember/15 px-3 py-1 text-sm font-black text-ember">
          {detail}
        </p>
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
    </Modal>
  );
};
