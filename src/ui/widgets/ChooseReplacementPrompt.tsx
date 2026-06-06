import type { CharacterCard } from '../../domain/game/types';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { GameCard } from './GameCard';
import { Modal } from './Modal';

type Props = {
  offered: CharacterCard[];
  onPick: (cardId: string) => void;
};

export const ChooseReplacementPrompt = ({ offered, onPick }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];

  return (
    <Modal
      open
      onClose={() => {}}
      dismissible={false}
      title={t.common.chooseReplacementTitle}
      subtitle={t.common.chooseReplacementHelp}
      size="sm"
    >
      <div className="grid gap-3 text-center">
        <p className="font-display text-sm font-black text-brass">{t.common.fromDeck}</p>
        <div className="flex justify-center gap-3">
          {offered.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => onPick(card.id)}
              className="rounded-2xl p-1 transition duration-150 hover:scale-95 focus:outline-none focus:ring-2 focus:ring-brass"
              aria-label={`${t.common.chooseReplacementTitle} ${t.roles[card.role].name}`}
            >
              <GameCard variant="face" role={card.role} size="lg" />
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};
