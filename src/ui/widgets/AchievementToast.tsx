import { Award, X } from 'lucide-react';
import { useEffect } from 'react';

type AchievementToastProps = {
  id: string;
  eyebrow: string;
  name: string;
  description: string;
  onClose(): void;
};

export const AchievementToast = ({ id, eyebrow, name, description, onClose }: AchievementToastProps) => {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timeout);
  }, [id, onClose]);

  return (
    <div className="fixed right-3 top-3 z-50 w-[min(22rem,calc(100vw-1.5rem))] animate-revealLift surface-strong rounded-2xl border border-brass/60 p-3 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-token-soft bg-[var(--surface-muted)] text-brass">
          <Award size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-brass">{eyebrow}</p>
          <p className="font-display text-lg font-black leading-tight gold-text">{name}</p>
          <p className="text-app-muted mt-1 text-sm leading-snug">{description}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close achievement"
          className="surface-control grid h-9 w-9 shrink-0 place-items-center rounded-full border"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
