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
  turn: 'border-brass/70 text-brass shadow-gold',
  target: 'border-ember/70 text-ember shadow-chipDanger',
  thinking: 'border-paper/40 text-app',
  winner: 'border-emerald-400/70 text-emerald-300',
};

export const TableCenter = ({ prompt, subPrompt, highlight = 'turn', announcement = null, bankRef }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];

  return (
    <div className="relative grid place-items-center gap-2 py-2 sm:gap-3 sm:py-4">
      {/* Deck stack */}
      <div className="relative grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center justify-items-center gap-2 sm:w-auto sm:gap-6">
        <div className="relative h-16 w-11 sm:h-32 sm:w-20">
          <div className="card-back-pattern absolute inset-0 rounded-lg shadow-card -rotate-6" />
          <div className="card-back-pattern absolute inset-0 rounded-lg shadow-card rotate-1" />
          <div className="card-back-pattern absolute inset-0 rounded-lg shadow-card border border-brass/55">
            <div className="absolute inset-1 rounded-md border border-brass/50" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="font-display text-base font-black tracking-widest text-brass/80 drop-shadow sm:text-2xl">S</span>
            </div>
          </div>
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest text-paper/60 sm:-bottom-5 sm:text-[10px]">
            deck
          </span>
        </div>

        <div className={`relative min-w-0 w-full max-w-[260px] overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-[#111821]/95 via-[#070b10]/95 to-[#10180f]/95 px-3 py-2 text-center shadow-card backdrop-blur-sm transition sm:min-w-[260px] sm:px-4 sm:py-3 ${highlightStyle[highlight]}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(229,180,82,0.22),transparent_46%)]" />
          <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brass to-transparent" />
          <p className="relative inline-flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] opacity-90 sm:gap-1.5 sm:text-[10px] sm:tracking-[0.22em]">
            {announcement ? <Gavel size={13} /> : <Sparkles size={13} />}
            {announcement ? t.common.tableDecision : t.common.table}
          </p>
          {announcement ? (
            <div className="relative animate-pulseGold">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brass">{announcement.actor}</p>
              <p className={`mt-1 line-clamp-2 font-display text-base font-black leading-tight sm:text-2xl ${announcement.accent ?? 'gold-text'}`}>
                {announcement.action}
              </p>
            </div>
          ) : (
            <p className="relative line-clamp-2 font-display text-sm font-black leading-tight sm:text-xl">{prompt}</p>
          )}
          {subPrompt ? (
            <p className="relative mx-auto mt-1 inline-flex max-w-full rounded-full border border-brass/35 bg-black/25 px-2 py-0.5 text-[10px] font-bold opacity-90 sm:mt-2 sm:px-3 sm:py-1 sm:text-xs">
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
            <div className="relative -mt-1 grid h-10 w-12 place-items-center overflow-hidden rounded-xl border border-brass bg-gradient-to-br from-[#fff0a5] via-[#c88b21] to-[#4d2b06] shadow-gold animate-floatSlow sm:h-20 sm:w-24 sm:rounded-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.55),transparent_35%)]" />
              <div className="absolute inset-1 rounded-xl border border-white/45" />
              <Landmark size={24} className="relative text-night/95 drop-shadow sm:size-10" />
              <Vault size={13} className="absolute bottom-1.5 right-1.5 text-night/85 sm:bottom-2 sm:right-2 sm:size-6" />
            </div>
          </div>
          <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-paper/70 sm:-bottom-5 sm:text-[10px]">
            bank
          </span>
        </div>
      </div>
    </div>
  );
};
