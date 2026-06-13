import { useEffect } from 'react';

// Phones (coarse pointer + short side <= this many CSS px) are forced to landscape
// so the table has room. Tablets and desktops are left untouched.
const PHONE_MAX_SHORT_SIDE = 600;

const isPhone = (): boolean => {
  if (typeof window === 'undefined') return false;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const screen = window.screen;
  const shortSide = screen ? Math.min(screen.width, screen.height) : window.innerWidth;
  return coarsePointer && shortSide > 0 && shortSide <= PHONE_MAX_SHORT_SIDE;
};

const tryLockLandscape = (): void => {
  const orientation = window.screen?.orientation as
    | (ScreenOrientation & { lock?: (orientation: string) => Promise<void> })
    | undefined;
  // Supported on most Android browsers; unsupported on iOS Safari, where the CSS fallback covers it.
  orientation?.lock?.('landscape').catch(() => {});
};

/**
 * Forces a landscape experience on phones: requests a native orientation lock where
 * supported, and otherwise rotates the app with CSS so portrait phones still get the
 * wider table layout. No-op on tablets and desktops.
 */
export function useForceLandscape(): void {
  useEffect(() => {
    if (!isPhone()) return undefined;
    const root = document.documentElement;
    const portrait = window.matchMedia('(orientation: portrait)');

    const sync = () => {
      // If the native lock did not take effect (e.g. iOS), force-rotate via CSS.
      root.classList.toggle('force-landscape', portrait.matches);
    };

    tryLockLandscape();
    sync();
    portrait.addEventListener('change', sync);
    return () => {
      portrait.removeEventListener('change', sync);
      root.classList.remove('force-landscape');
    };
  }, []);
}
