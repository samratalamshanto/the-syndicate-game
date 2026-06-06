import { ShieldX } from 'lucide-react';
import { useEffect } from 'react';
import { formatMessage, translations } from '../../i18n/translations';
import type { CardLossEvent } from '../../store/useGameStore';
import { useGameStore } from '../../store/useGameStore';

type Props = {
  event: CardLossEvent | null;
  onDone: (id: string) => void;
};

export const CardLossMoment = ({ event, onDone }: Props) => {
  const language = useGameStore((state) => state.language);
  const theme = useGameStore((state) => state.theme);
  const t = translations[language];

  useEffect(() => {
    if (!event) return undefined;
    const timer = window.setTimeout(() => onDone(event.id), event.eliminated ? 1650 : 1350);
    return () => window.clearTimeout(timer);
  }, [event, onDone]);

  if (!event) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[79] grid place-items-end bg-[rgba(26,35,50,0.55)] p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
      <div className="bottom-sheet surface-strong grid w-full justify-items-center gap-4 rounded-t-2xl px-4 py-5 text-center sm:w-auto sm:rounded-2xl sm:bg-transparent sm:p-0">
        <div className="reveal-card relative h-40 w-28 overflow-hidden rounded-xl border-2 border-brass shadow-card">
          <div className={`absolute inset-0 ${theme === 'dark' ? 'card-back-pattern' : 'card-back-pattern-light'}`} />
        </div>
        <div className="surface-strong w-full rounded-xl border-2 border-token px-4 py-3 shadow-card sm:w-auto sm:px-6">
          <p className="inline-flex items-center justify-center gap-2 font-display text-xl font-black text-app sm:text-2xl">
            <ShieldX size={22} className="text-brass" />
            {formatMessage(t.common.cardLossMoment, { player: event.playerName })}
          </p>
        </div>
      </div>
    </div>
  );
};
