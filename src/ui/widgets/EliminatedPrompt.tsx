import { Eye, RefreshCcw, Settings, Skull } from 'lucide-react';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { Modal } from './Modal';

type Props = {
  onWatch: () => void;
  onSameSettings: () => void;
  onChangeSettings: () => void;
};

export const EliminatedPrompt = ({ onWatch, onSameSettings, onChangeSettings }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];

  return (
    <Modal
      open
      onClose={onWatch}
      title={t.common.youAreOut}
      subtitle={t.common.spectateOrRestart}
      icon={<Skull size={18} />}
      size="lg"
    >
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={onWatch}
            className="group grid min-h-24 gap-2 rounded-xl border border-emerald-400/45 bg-emerald-500/15 px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-500/25 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-400 text-night">
              <Eye size={17} />
            </span>
            <span>
              <span className="block font-display text-sm font-black text-app">{t.common.watchMatch}</span>
              <span className="mt-1 block text-xs leading-snug text-app-muted">{t.common.spectating}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onSameSettings}
            className="group grid min-h-24 gap-2 rounded-xl border border-brass/60 bg-brass/15 px-4 py-3 text-left transition hover:border-brass hover:bg-brass/25 focus:outline-none focus:ring-2 focus:ring-brass"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brass text-night">
              <RefreshCcw size={17} />
            </span>
            <span>
              <span className="block font-display text-sm font-black text-app">{t.common.sameSettings}</span>
              <span className="mt-1 block text-xs leading-snug text-app-muted">{t.common.newGame}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onChangeSettings}
            className="group grid min-h-24 gap-2 rounded-xl border border-token-soft bg-transparent px-4 py-3 text-left transition hover:border-brass/70 hover:bg-brass/10 focus:outline-none focus:ring-2 focus:ring-brass"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full border border-token-soft text-brass">
              <Settings size={17} />
            </span>
            <span>
              <span className="block font-display text-sm font-black text-app">{t.common.changeSettings}</span>
              <span className="mt-1 block text-xs leading-snug text-app-muted">{t.common.backToSetup}</span>
            </span>
          </button>
      </div>
    </Modal>
  );
};
