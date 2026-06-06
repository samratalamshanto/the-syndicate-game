import { Eye, RefreshCcw, Skull } from 'lucide-react';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

type Props = {
  onWatch: () => void;
  onSameSettings: () => void;
  onChangeSettings: () => void;
};

export const EliminatedPrompt = ({ onWatch, onSameSettings, onChangeSettings }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 backdrop-blur-sm sm:place-items-center">
      <div className="bottom-sheet surface-strong grid w-full max-w-xl gap-4 rounded-t-2xl border-2 border-ember px-5 py-5 text-center shadow-card sm:rounded-2xl">
        <Skull size={38} className="mx-auto text-ember" />
        <div>
          <h3 className="font-display text-3xl font-black text-ember">{t.common.youAreOut}</h3>
          <p className="text-app-muted text-sm">{t.common.spectateOrRestart}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={onWatch}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 font-display font-black text-night"
          >
            <Eye size={16} />
            {t.common.watchMatch}
          </button>
          <button
            type="button"
            onClick={onSameSettings}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brass px-4 py-2 font-display font-black text-night"
          >
            <RefreshCcw size={16} />
            {t.common.sameSettings}
          </button>
          <button
            type="button"
            onClick={onChangeSettings}
            className="surface-control min-h-11 rounded-full border px-4 py-2 font-display font-black"
          >
            {t.common.changeSettings}
          </button>
        </div>
      </div>
    </div>
  );
};
