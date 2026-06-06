import { ShieldAlert } from 'lucide-react';
import { formatMessage, translations } from '../../i18n/translations';
import type { ChallengeEvent } from '../../store/useGameStore';
import { useGameStore } from '../../store/useGameStore';
import { MOMENT_TIMING, MomentBanner } from './MomentBanner';

type Props = {
  event: ChallengeEvent | null;
  onDone: (id: string) => void;
};

export const ChallengeBanner = ({ event, onDone }: Props) => {
  const language = useGameStore((state) => state.language);
  const gamePhase = useGameStore((state) => state.game?.phase);
  const t = translations[language];

  if (!event || gamePhase === 'complete') {
    return null;
  }

  const roleName = event.claimedRole ? t.roles[event.claimedRole].name : t.common.hidden;
  const headline =
    event.outcome === 'liar'
      ? formatMessage(t.common.challengeOneLineLiar, { challenger: event.challenger, actor: event.actor, role: roleName })
      : formatMessage(t.common.challengeOneLineTruth, { challenger: event.challenger, actor: event.actor, role: roleName });
  const detail = formatMessage(t.common.challengeLoserLine, { player: event.loserName });

  return (
    <MomentBanner
      key={event.id}
      onDone={() => onDone(event.id)}
      timeoutMs={MOMENT_TIMING.long}
      headline={headline}
      detail={detail}
      icon={<ShieldAlert size={22} />}
      tone={event.outcome === 'liar' ? 'alert' : 'success'}
      className="z-[75]"
    />
  );
};
