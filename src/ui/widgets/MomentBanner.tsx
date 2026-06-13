import { useEffect, type ReactNode } from 'react';

export const MOMENT_TIMING = {
  short: 1400,
  normal: 1800,
  long: 2600,
} as const;

type Tone = 'reveal' | 'success' | 'alert' | 'neutral';

type MomentBannerProps = {
  onDone: () => void;
  timeoutMs: number;
  headline: string;
  detail?: string;
  icon?: ReactNode;
  tone?: Tone;
  className?: string;
  children?: ReactNode;
};

const toneStyle: Record<Tone, { borderColor: string; iconClass: string }> = {
  reveal: { borderColor: 'var(--accent)', iconClass: 'text-accent' },
  success: { borderColor: 'var(--success)', iconClass: 'text-success' },
  alert: { borderColor: 'var(--alert)', iconClass: 'text-alert' },
  neutral: { borderColor: 'var(--line)', iconClass: 'text-app-muted' },
};

export const MomentBanner = ({
  onDone,
  timeoutMs,
  headline,
  detail,
  icon,
  tone = 'neutral',
  className = 'z-40',
  children,
}: MomentBannerProps) => {
  const style = toneStyle[tone];

  useEffect(() => {
    const timer = window.setTimeout(onDone, timeoutMs);
    return () => window.clearTimeout(timer);
  }, [onDone, timeoutMs]);

  return (
    <div className={`pointer-events-none fixed inset-x-0 bottom-0 px-0 sm:bottom-auto sm:top-[24vh] sm:px-4 ${className}`}>
      <button
        type="button"
        onClick={onDone}
        aria-label="Dismiss"
        className={`bottom-sheet surface-strong pointer-events-auto mx-auto grid w-full max-w-xl cursor-pointer justify-items-center gap-3 rounded-t-2xl border-x border-b border-token px-5 pb-5 pt-4 text-left shadow-card sm:rounded-2xl sm:px-6 ${
          tone === 'alert' ? 'banner-alert-pop' : ''
        }`}
        style={{ borderTop: `4px solid ${style.borderColor}` }}
      >
        {children ? <div className="grid justify-items-center">{children}</div> : null}
        <div className="flex max-w-full items-center justify-center gap-3 text-center">
          {icon ? <span className={`grid h-8 w-8 shrink-0 place-items-center ${style.iconClass}`}>{icon}</span> : null}
          <p className="font-display text-2xl font-black leading-tight text-app">{headline}</p>
        </div>
        {detail ? <p className="max-w-md text-center text-sm font-medium leading-snug text-app-muted">{detail}</p> : null}
        <span className="text-[10px] font-bold uppercase tracking-widest text-app-muted">tap to dismiss</span>
      </button>
    </div>
  );
};
