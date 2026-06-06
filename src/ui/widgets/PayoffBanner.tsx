import { Crown, ShieldCheck, Skull } from 'lucide-react';
import { useEffect } from 'react';
import { formatMessage, translations } from '../../i18n/translations';
import type { PayoffEvent } from '../../store/useGameStore';
import { useGameStore } from '../../store/useGameStore';

type Props = {
  event: PayoffEvent | null;
  onDone: (id: string) => void;
};

export const PayoffBanner = ({ event, onDone }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];

  useEffect(() => {
    if (!event) return undefined;
    const timer = window.setTimeout(() => onDone(event.id), event.type === 'doubleShot' ? 1900 : 1500);
    return () => window.clearTimeout(timer);
  }, [event, onDone]);

  if (!event) return null;

  const content = {
    gotcha: {
      icon: <Crown size={28} />,
      title: t.common.gotcha,
      line: event.personaName ?? '',
      className: 'border-brass text-brass gold-flash',
    },
    blocked: {
      icon: <ShieldCheck size={28} />,
      title: t.common.blocked,
      line: event.role ? t.roles[event.role].name : t.common.survived,
      className: 'border-cyan-300 text-cyan-200',
    },
    doubleShot: {
      icon: <Skull size={30} />,
      title: t.common.doubleShot,
      line: formatMessage(t.common.youEliminated, { persona: event.personaName ?? '' }),
      className: 'border-ember text-ember red-flash',
    },
  }[event.type];

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[85] px-0 sm:bottom-auto sm:top-[18vh] sm:px-4">
      <div className={`bottom-sheet surface-strong mx-auto grid max-w-4xl justify-items-center gap-1 rounded-t-2xl border-2 px-5 py-5 text-center shadow-gold sm:rounded-2xl sm:px-6 ${content.className}`}>
        <div className="inline-flex items-center gap-2 font-display text-2xl font-black uppercase tracking-[0.16em] sm:text-3xl">
          {content.icon}
          {content.title}
        </div>
        <p className="text-app-muted text-sm font-black uppercase tracking-widest">{content.line}</p>
      </div>
    </div>
  );
};
