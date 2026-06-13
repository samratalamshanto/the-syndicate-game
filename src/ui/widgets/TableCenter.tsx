import { Gavel, Landmark, Sparkles, Vault } from 'lucide-react';
import type { Ref } from 'react';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

type Props = {
  prompt: string;
  subPrompt?: string;
  highlight?: 'turn' | 'target' | 'thinking' | 'winner';
  announcement?: {
    actor: string;
    action: string;
    accent?: string;
  } | null;
  bankRef?: Ref<HTMLDivElement>;
};

const highlightStyle: Record<NonNullable<Props['highlight']>, string> = {
  turn: 'border-brass/55',
  target: 'border-ember/60',
  thinking: 'thinking-surface',
  winner: 'border-emerald-400/70',
};

export const TableCenter = ({ prompt, subPrompt, highlight = 'turn', announcement = null, bankRef }: Props) => {
  const language = useGameStore((state) => state.language);
  const theme = useGameStore((state) => state.theme);
  const t = translations[language];
  const cardBackClass = theme === 'dark' ? 'card-back-pattern' : 'card-back-pattern-light';

  return (
    <div className="relative grid place-items-center gap-2 py-2 sm:gap-3 sm:py-4">
      {/* Deck stack */}
      <div className="relative grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center justify-items-center gap-2 sm:w-auto sm:gap-6">
        <div className="relative h-16 w-11 sm:h-32 sm:w-20">
          <div className={`${cardBackClass} absolute inset-0 rounded-lg shadow-card -rotate-6`} />
          <div className={`${cardBackClass} absolute inset-0 rounded-lg shadow-card rotate-1`} />
          <div className={`${cardBackClass} absolute inset-0 rounded-lg shadow-card border border-brass/55`}>
            <div className="absolute inset-1 rounded-md border border-brass/50" />
          </div>
          <span className="text-app absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest sm:-bottom-5 sm:text-[10px]">
            deck
          </span>
        </div>

        <div className={`surface-strong relative min-w-0 w-full max-w-[300px] overflow-hidden rounded-xl border px-4 py-3 text-center transition sm:min-w-[300px] sm:px-5 sm:py-4 ${highlightStyle[highlight]}`}>
          <p className="relative inline-flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] text-brass opacity-95 sm:gap-1.5 sm:text-[10px] sm:tracking-[0.22em]">
            {announcement ? <Gavel size={13} /> : <Sparkles size={13} />}
            {announcement ? t.common.tableDecision : t.common.table}
          </p>
          {announcement ? (
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brass">{announcement.actor}</p>
              <p className={`mt-1 line-clamp-2 font-display text-base font-black leading-tight sm:text-2xl ${announcement.accent ?? 'text-brass'}`}>
                {announcement.action}
              </p>
            </div>
          ) : (
            <p className="relative mx-auto mt-1 max-w-[16rem] font-display text-lg font-black leading-snug text-app sm:text-2xl">
              {prompt}
            </p>
          )}
          {subPrompt ? (
            <p className="relative mx-auto mt-2 inline-flex max-w-full rounded-full border border-brass/70 bg-brass px-3 py-1 text-[10px] font-black text-night shadow-innerGold sm:px-4 sm:text-xs">
              {subPrompt}
            </p>
          ) : null}
        </div>

        {/* Treasury */}
        <div ref={bankRef} className="relative grid h-16 w-14 place-items-center sm:h-32 sm:w-28">
          <div className="absolute bottom-2 grid place-items-center">
            <div className="coin-disc h-2 w-10 rounded-full sm:h-4 sm:w-16" />
            <div className="coin-disc -mt-1 h-2 w-12 rounded-full sm:h-4 sm:w-20" />
            <div className="coin-disc -mt-1 h-2 w-10 rounded-full sm:h-4 sm:w-16" />
            <div className="relative -mt-1 grid h-10 w-12 place-items-center overflow-hidden rounded-xl border border-brass bg-[var(--surface)] sm:h-20 sm:w-24 sm:rounded-2xl">
              <div className="absolute inset-1 rounded-xl border border-token-soft" />
              <Landmark size={24} className="relative text-app drop-shadow sm:size-10" />
              <Vault size={13} className="absolute bottom-1.5 right-1.5 text-app-muted sm:bottom-2 sm:right-2 sm:size-6" />
            </div>
          </div>
          <span className="text-app absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest sm:-bottom-5 sm:text-[10px]">
            bank
          </span>
        </div>
      </div>
    </div>
  );
};
