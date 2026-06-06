import { Skull } from 'lucide-react';
import { formatMessage, translations } from '../../i18n/translations';
import type { RevealEvent } from '../../store/useGameStore';
import { useGameStore } from '../../store/useGameStore';
import { GameCard } from './GameCard';
import { MOMENT_TIMING, MomentBanner } from './MomentBanner';

type Props = {
  event: RevealEvent | null;
  onDone: (id: string) => void;
};

export const RevealMoment = ({ event, onDone }: Props) => {
  const language = useGameStore((state) => state.language);
  const gamePhase = useGameStore((state) => state.game?.phase);
  const t = translations[language];

  if (!event || gamePhase === 'complete') {
    return null;
  }

  const roleName = t.roles[event.role].name;
  const headline = event.eliminated
    ? t.common.eliminated
    : formatMessage(t.common.revealedCard, { player: event.playerName, role: roleName });
  const detail = event.eliminated
    ? formatMessage(t.common.revealedCard, { player: event.playerName, role: roleName })
    : undefined;

  return (
    <MomentBanner
      key={event.id}
      onDone={() => onDone(event.id)}
      timeoutMs={event.eliminated ? MOMENT_TIMING.long : MOMENT_TIMING.normal}
      headline={headline}
      detail={detail}
      icon={event.eliminated ? <Skull size={22} /> : undefined}
      tone={event.eliminated ? 'alert' : 'reveal'}
      className="z-[80]"
    >
      <div className="reveal-card">
        <GameCard variant="face" role={event.role} size="lg" />
      </div>
    </MomentBanner>
  );
};
