import { formatMessage, translations } from '../../i18n/translations';
import type { CardLossEvent } from '../../store/useGameStore';
import { useGameStore } from '../../store/useGameStore';
import { MOMENT_TIMING, MomentBanner } from './MomentBanner';

type Props = {
  event: CardLossEvent | null;
  onDone: (id: string) => void;
};

export const CardLossMoment = ({ event, onDone }: Props) => {
  const language = useGameStore((state) => state.language);
  const gamePhase = useGameStore((state) => state.game?.phase);
  const theme = useGameStore((state) => state.theme);
  const t = translations[language];

  if (!event || gamePhase === 'complete') {
    return null;
  }

  const headline = event.role
    ? formatMessage(t.common.cardLossMomentRole, { player: event.playerName, role: t.roles[event.role].name })
    : formatMessage(t.common.cardLossMoment, { player: event.playerName });

  return (
    <MomentBanner
      key={event.id}
      onDone={() => onDone(event.id)}
      timeoutMs={MOMENT_TIMING.normal}
      headline={headline}
      tone={event.eliminated ? 'alert' : 'neutral'}
      className="z-[79]"
    >
      <div className="reveal-card relative h-40 w-28 overflow-hidden rounded-xl border-2 border-brass shadow-card">
        <div className={`absolute inset-0 ${theme === 'dark' ? 'card-back-pattern' : 'card-back-pattern-light'}`} />
      </div>
    </MomentBanner>
  );
};
