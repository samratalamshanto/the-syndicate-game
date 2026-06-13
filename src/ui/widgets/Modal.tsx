import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  actions?: ReactNode;
  dismissible?: boolean;
  children: ReactNode;
};

const sizeClass: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
};

export const Modal = ({ open, onClose, title, subtitle, icon, size = 'md', actions, dismissible = true, children }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  useFocusTrap(panelRef, open, dismissible ? onClose : () => {});

  // Lock background scroll while a modal is open so the page can't scroll behind it.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-[rgba(26,35,50,0.7)] p-0 backdrop-blur-sm sm:place-items-center sm:p-3"
      onClick={dismissible ? onClose : undefined}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bottom-sheet surface-strong flex max-h-[92dvh] w-full ${sizeClass[size]} flex-col overflow-hidden rounded-t-2xl border-2 shadow-card sm:rounded-2xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="surface-strong sticky top-0 z-10 flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {icon ? <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brass/15 text-brass">{icon}</span> : null}
            <div className="min-w-0">
              <h3 className="modal-h1 truncate">{title}</h3>
              {subtitle ? <p className="text-app-muted text-xs font-bold">{subtitle}</p> : null}
            </div>
          </div>
          {dismissible ? (
            <button
              type="button"
              onClick={onClose}
              className="surface-control grid h-11 w-11 shrink-0 place-items-center rounded-full border sm:h-9 sm:w-9"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
        <div className="modal-body min-h-0 flex-1 overflow-auto scroll-tight p-4">{children}</div>
        {actions ? <div className="surface-strong sticky bottom-0 border-t px-4 py-3">{actions}</div> : null}
      </div>
    </div>
  );
};
