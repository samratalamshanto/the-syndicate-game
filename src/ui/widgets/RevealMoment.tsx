import { Skull } from 'lucide-react';
import { useEffect } from 'react';
import { formatMessage, translations } from '../../i18n/translations';
import type { RevealEvent } from '../../store/useGameStore';
import { useGameStore } from '../../store/useGameStore';
import { GameCard } from './GameCard';

type Props = {
  event: RevealEvent | null;
  onDone: (id: string) => void;
};

export const RevealMoment = ({ event, onDone }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];

  useEffect(() => {
    if (!event) return undefined;
    const timer = window.setTimeout(() => onDone(event.id), event.eliminated ? 1750 : 1350);
    return () => window.clearTimeout(timer);
  }, [event, onDone]);

  if (!event) {
    return null;
  }

  const roleName = t.roles[event.role].name;

  return (
    <div className={`pointer-events-none fixed inset-0 z-[80] grid place-items-end bg-[rgba(26,35,50,0.7)] p-0 backdrop-blur-sm sm:place-items-center sm:p-4 ${event.eliminated ? 'red-flash' : 'gold-flash'}`}>
      <div className="bottom-sheet surface-strong grid w-full justify-items-center gap-4 rounded-t-2xl px-4 py-5 text-center sm:w-auto sm:rounded-2xl sm:bg-transparent sm:p-0">
        {event.eliminated ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-ember bg-danger px-5 py-2 font-display text-2xl font-black uppercase tracking-widest shadow-chipDanger">
            <Skull size={26} />
            {t.common.eliminated}
          </div>
        ) : null}
        <div className="reveal-card">
          <GameCard variant="face" role={event.role} size="lg" />
        </div>
        <div className="surface-strong w-full rounded-xl border-2 border-brass px-4 py-3 shadow-gold sm:w-auto sm:px-6">
          <p className="font-display text-xl font-black gold-text sm:text-2xl">
            {formatMessage(t.common.revealedCard, { player: event.playerName, role: roleName })}
          </p>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.28em] text-brass">{roleName}</p>
        </div>
      </div>
    </div>
  );
};
