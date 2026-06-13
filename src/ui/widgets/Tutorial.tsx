import { BadgeHelp, CheckCircle2, ShieldAlert, ShieldCheck, Target, Trophy } from 'lucide-react';
import { useState } from 'react';
import { formatMessage, translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { GameCard } from './GameCard';
import { Modal } from './Modal';

type Props = {
  onClose: () => void;
};

const TOTAL_STEPS = 5;
const CHALLENGE_STEP = 3;

export const Tutorial = ({ onClose }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const tut = t.tutorial;
  const [step, setStep] = useState(0);
  const [reaction, setReaction] = useState<'challenge' | 'pass' | null>(null);

  const demoBot = 'Iron';
  const demoRole = t.roles.leader.name; // CEO in syndicate brand

  const next = () => (step < TOTAL_STEPS - 1 ? setStep((value) => value + 1) : onClose());
  const back = () => setStep((value) => Math.max(0, value - 1));
  const nextDisabled = step === CHALLENGE_STEP && reaction === null;
  const nextLabel = step === TOTAL_STEPS - 1 ? tut.play : tut.next;

  return (
    <Modal open onClose={onClose} title={t.common.guide} subtitle={`${step + 1} / ${TOTAL_STEPS}`} icon={<BadgeHelp size={18} />} size="md">
      <div className="grid gap-4">
        {step === 0 ? (
          <div className="grid gap-3 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
              <Trophy size={24} />
            </span>
            <h3 className="modal-h2">{tut.goalTitle}</h3>
            <p className="text-app-muted text-sm">{t.guide.intro}</p>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-3">
            <h3 className="modal-h2">{tut.handTitle}</h3>
            <div className="flex justify-center gap-3">
              <GameCard variant="face" role="leader" size="md" yours />
              <GameCard variant="face" role="helper" size="md" yours />
            </div>
            <p className="text-app-muted text-sm">{tut.handBody}</p>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3">
            <h3 className="modal-h2">{tut.bluffTitle}</h3>
            <div className="flex flex-wrap justify-center gap-2 text-xs font-black">
              <span className="inline-flex items-center gap-1 rounded-full border border-success/50 bg-success/10 px-2.5 py-1 text-success">
                <ShieldCheck size={14} /> {demoRole}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/50 bg-amber-500/10 px-2.5 py-1 text-amber-700 dark:text-amber-400">
                <ShieldAlert size={14} /> {t.common.bluffTag}
              </span>
            </div>
            <p className="text-app-muted text-sm">{tut.bluffBody}</p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3">
            <h3 className="modal-h2">{tut.challengeTitle}</h3>
            <p className="text-app-muted text-sm">{tut.challengeBody}</p>
            <div className="surface-muted rounded-xl border border-token-soft px-3 py-3 text-center font-display text-sm font-black text-app">
              {formatMessage(tut.challengeClaim, { bot: demoBot, role: demoRole })}
            </div>
            {reaction === null ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReaction('challenge')}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-ember bg-alert px-4 py-2 font-display text-sm font-black shadow-chipDanger transition hover:brightness-110"
                >
                  <Target size={16} />
                  {tut.challengeBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setReaction('pass')}
                  className="action-choice inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2 font-display text-sm font-black transition"
                >
                  {tut.passBtn}
                </button>
              </div>
            ) : (
              <div
                className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold ${
                  reaction === 'challenge' ? 'border-success/50 bg-success/10 text-app' : 'border-token-soft text-app-muted'
                }`}
              >
                <CheckCircle2 size={18} className={`mt-0.5 shrink-0 ${reaction === 'challenge' ? 'text-success' : 'text-app-muted'}`} />
                <span>{reaction === 'challenge' ? formatMessage(tut.challengeWin, { bot: demoBot }) : tut.passResult}</span>
              </div>
            )}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-3 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-accent">
              <CheckCircle2 size={24} />
            </span>
            <h3 className="modal-h2">{tut.readyTitle}</h3>
            <p className="text-app-muted text-sm">{tut.readyBody}</p>
          </div>
        ) : null}

        <nav className="flex items-center justify-between gap-2 border-t border-token-soft pt-3">
          <button type="button" onClick={onClose} className="text-app-muted px-2 py-1.5 text-sm font-bold">
            {tut.skip}
          </button>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button type="button" onClick={back} className="surface-control min-h-9 rounded-full border px-3 py-1.5 text-sm font-black">
                {tut.back}
              </button>
            ) : null}
            <button
              type="button"
              onClick={next}
              disabled={nextDisabled}
              className={`min-h-9 rounded-full bg-accent px-4 py-1.5 font-display text-sm font-black ${nextDisabled ? 'opacity-50' : ''}`}
            >
              {nextLabel}
            </button>
          </div>
        </nav>
      </div>
    </Modal>
  );
};
