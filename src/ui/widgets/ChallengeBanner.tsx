import { Gavel, ShieldAlert, Skull } from 'lucide-react';
import { useEffect } from 'react';
import { formatMessage, translations } from '../../i18n/translations';
import type { ChallengeEvent } from '../../store/useGameStore';
import { useGameStore } from '../../store/useGameStore';

type Props = {
  event: ChallengeEvent | null;
  onDone: (id: string) => void;
};

export const ChallengeBanner = ({ event, onDone }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];

  useEffect(() => {
    if (!event) return undefined;
    const timer = window.setTimeout(() => onDone(event.id), 3200);
    return () => window.clearTimeout(timer);
  }, [event, onDone]);

  if (!event) {
    return null;
  }

  const outcomeClass = event.outcome === 'liar' ? 'text-ember' : 'text-emerald-300';
  const outcome = event.outcome === 'liar' ? t.common.liar : t.common.truth;
  const roleName = event.claimedRole ? t.roles[event.claimedRole].name : t.common.hidden;
  const actionName = event.originalActionType ? t.actions[event.originalActionType] : t.common.challengeAction;
  const targetLine = event.targetName
    ? formatMessage(t.common.challengeTargetLine, { action: actionName, target: event.targetName })
    : formatMessage(t.common.challengeNoTargetLine, { action: actionName });
  const resultLine =
    event.outcome === 'liar'
      ? formatMessage(t.common.challengeResultLiar, { actor: event.actor, role: roleName })
      : formatMessage(t.common.challengeResultTruth, { actor: event.actor, role: roleName });

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[75] px-0 sm:bottom-auto sm:top-[26vh] sm:px-3">
      <div className="bottom-sheet surface-strong relative mx-auto grid max-w-3xl gap-4 overflow-hidden rounded-t-2xl border-2 border-token px-5 py-5 shadow-gold sm:rounded-2xl sm:px-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(229,180,82,0.24),transparent_42%)]" />
        <div className="relative grid gap-4">
          <div className="text-center">
            <p className="inline-flex items-center justify-center gap-2 font-display text-2xl font-black uppercase tracking-[0.18em] gold-text sm:text-3xl">
              <ShieldAlert size={30} />
              {t.common.challenge}
            </p>
            <p className="text-app-muted mt-1 text-sm font-black">
              {formatMessage(t.common.challengeDuelLine, { challenger: event.challenger, actor: event.actor })}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="surface-muted rounded-xl border border-token-soft px-3 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brass">{t.common.powerClaimed}</p>
              <p className="mt-1 font-display text-lg font-black">{roleName}</p>
            </div>
            <div className="surface-muted rounded-xl border border-token-soft px-3 py-3">
              <p className="text-app-muted text-[10px] font-black uppercase tracking-[0.2em]">{t.common.tableDecision}</p>
              <p className="mt-1 text-sm font-bold leading-snug">{targetLine}</p>
            </div>
            <div className="surface-muted rounded-xl border border-token-soft px-3 py-3">
              <p className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-ember">
                <Skull size={12} />
                {t.common.cardLoss}
              </p>
              <p className="mt-1 font-display text-lg font-black">
                {formatMessage(t.common.challengeLoserLine, { player: event.loserName })}
              </p>
            </div>
          </div>

          <div className="surface-muted rounded-2xl border border-token-soft px-4 py-3 text-center">
            <p className={`inline-flex items-center justify-center gap-2 font-display text-2xl font-black uppercase tracking-widest ${outcomeClass}`}>
              <Gavel size={24} />
              {outcome}
            </p>
            <p className="text-app-muted mt-1 text-sm font-bold">{resultLine}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
