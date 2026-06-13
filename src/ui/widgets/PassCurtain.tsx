import { EyeOff, Hand } from 'lucide-react';
import { formatMessage, translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

type Props = {
  /** Display name of the player who should take the device next. */
  name: string;
  onReveal: () => void;
};

/**
 * Pass & play privacy screen. Fully covers the table so the outgoing player's hand
 * is hidden until the named player confirms they are holding the device. Rendered
 * inline (no portal) so the CSS-rotated #root still contains this fixed overlay.
 */
export const PassCurtain = ({ name, onReveal }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-night/95 px-6 backdrop-blur-md">
      <div className="surface-glass grid max-w-sm gap-5 rounded-3xl border border-brass/40 px-6 py-8 text-center shadow-card">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brass/15 text-brass">
          <EyeOff size={28} />
        </span>
        <div className="grid gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-brass">{t.common.passTitle}</p>
          <h2 className="font-display text-2xl font-black gold-text">{name}</h2>
          <p className="text-app-muted text-sm leading-relaxed">{formatMessage(t.common.passBody, { name })}</p>
        </div>
        <button
          type="button"
          onClick={onReveal}
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-success px-6 py-4 font-display text-base font-black text-white shadow-card hover:brightness-110"
        >
          <Hand size={18} />
          {formatMessage(t.common.passButton, { name })}
        </button>
      </div>
    </div>
  );
};
