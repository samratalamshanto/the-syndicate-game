import { Eye, RefreshCcw, Settings, Skull } from 'lucide-react';
import type { ReactNode } from 'react';
import { translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';
import { Modal } from './Modal';

type Props = {
  onWatch: () => void;
  onSameSettings: () => void;
  onChangeSettings: () => void;
  /** Compact rows instead of tall tiles, for the short landscape board. */
  compact?: boolean;
};

export const EliminatedPrompt = ({ onWatch, onSameSettings, onChangeSettings, compact = false }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];

  type Choice = { onClick: () => void; icon: ReactNode; iconWrap: string; title: string; subtitle: string; className: string };
  const choices: Choice[] = [
    {
      onClick: onWatch,
      icon: <Eye size={compact ? 15 : 17} />,
      iconWrap: 'bg-success text-night',
      title: t.common.watchMatch,
      subtitle: t.common.spectating,
      className: 'border-success/40 bg-success/15 hover:border-success focus:ring-success',
    },
    {
      onClick: onSameSettings,
      icon: <RefreshCcw size={compact ? 15 : 17} />,
      iconWrap: 'bg-accent text-night',
      title: t.common.sameSettings,
      subtitle: t.common.newGame,
      className: 'bg-accent-soft border-accent-soft hover:border-accent focus:ring-brass',
    },
    {
      onClick: onChangeSettings,
      icon: <Settings size={compact ? 15 : 17} />,
      iconWrap: 'border border-token-soft text-brass',
      title: t.common.changeSettings,
      subtitle: t.common.backToSetup,
      className: 'border-token-soft bg-transparent hover:border-brass/70 hover:bg-brass/10 focus:ring-brass',
    },
  ];

  return (
    <Modal
      open
      onClose={onWatch}
      title={t.common.youAreOut}
      subtitle={t.common.spectateOrRestart}
      icon={<Skull size={18} />}
      size={compact ? 'md' : 'lg'}
    >
      <div className={compact ? 'grid gap-2' : 'grid gap-3 sm:grid-cols-3'}>
        {choices.map((choice) => (
          <button
            key={choice.title}
            type="button"
            onClick={choice.onClick}
            className={`rounded-xl border text-app transition focus:outline-none focus:ring-2 ${choice.className} ${
              compact ? 'flex items-center gap-3 px-3 py-2' : 'grid min-h-24 gap-2 px-4 py-3 text-left'
            }`}
          >
            <span className={`grid shrink-0 place-items-center rounded-full ${compact ? 'h-8 w-8' : 'h-9 w-9'} ${choice.iconWrap}`}>
              {choice.icon}
            </span>
            <span className={compact ? 'min-w-0 text-left' : ''}>
              <span className="block font-display text-sm font-black text-app">{choice.title}</span>
              <span className={`block text-xs leading-snug text-app-muted ${compact ? '' : 'mt-1'}`}>{choice.subtitle}</span>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
};
