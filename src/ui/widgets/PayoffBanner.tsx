import { Crown, ShieldCheck, Skull } from 'lucide-react';
import { formatMessage, translations } from '../../i18n/translations';
import type { PayoffEvent } from '../../store/useGameStore';
import { useGameStore } from '../../store/useGameStore';
import { MOMENT_TIMING, MomentBanner } from './MomentBanner';

type Props = {
  event: PayoffEvent | null;
  onDone: (id: string) => void;
};

export const PayoffBanner = ({ event, onDone }: Props) => {
  const language = useGameStore((state) => state.language);
  const gamePhase = useGameStore((state) => state.game?.phase);
  const t = translations[language];

  if (!event || gamePhase === 'complete') return null;

  const content = {
    gotcha: {
      icon: <Crown size={28} />,
      headline: t.common.gotcha,
      detail: event.personaName ?? '',
      tone: 'neutral' as const,
      timeoutMs: MOMENT_TIMING.short,
    },
    blocked: {
      icon: <ShieldCheck size={28} />,
      headline: t.common.blocked,
      detail: event.role ? t.roles[event.role].name : t.common.survived,
      tone: 'success' as const,
      timeoutMs: MOMENT_TIMING.short,
    },
    doubleShot: {
      icon: <Skull size={30} />,
      headline: t.common.doubleShot,
      detail: formatMessage(t.common.youEliminated, { persona: event.personaName ?? '' }),
      tone: 'alert' as const,
      timeoutMs: MOMENT_TIMING.normal,
    },
  }[event.type];

  return (
    <MomentBanner
      key={event.id}
      onDone={() => onDone(event.id)}
      timeoutMs={content.timeoutMs}
      headline={content.headline}
      detail={content.detail}
      icon={content.icon}
      tone={content.tone}
      className="z-40"
    />
  );
};
