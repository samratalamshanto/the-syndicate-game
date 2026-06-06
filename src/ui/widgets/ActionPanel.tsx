import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  eyebrow: string;
  title: string;
  detail?: string;
  progress?: number | null;
  onCancel?: () => void;
  children: ReactNode;
};

export const ActionPanel = ({ eyebrow, title, detail, progress = null, onCancel, children }: Props) => (
  <div className="bottom-sheet surface-strong sticky bottom-0 z-30 -mx-1 rounded-2xl border px-3 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-card sm:mx-auto sm:max-w-6xl">
    {progress !== null ? (
      <div className="absolute inset-x-4 top-0 h-0.5 overflow-hidden rounded-full bg-[var(--line-soft)]">
        <div className="h-full bg-danger transition-[width]" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} />
      </div>
    ) : null}
    <div className="flex items-center justify-between gap-3 pb-2">
      <div>
        <p className="text-xs font-black uppercase text-brass">{eyebrow}</p>
        <h3 className="font-display text-base font-black">{title}</h3>
        {detail ? <p className="text-app-muted text-xs">{detail}</p> : null}
      </div>
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="surface-control grid h-11 w-11 shrink-0 place-items-center rounded-full border"
          aria-label="Cancel"
        >
          <X size={18} />
        </button>
      ) : null}
    </div>
    {children}
  </div>
);
