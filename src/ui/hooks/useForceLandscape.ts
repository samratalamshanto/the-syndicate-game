import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

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
  // Works on most Android browsers; unsupported on iOS Safari, where the CSS fallback covers it.
  orientation?.lock?.('landscape').catch(() => {});
};

/**
 * Gives phones a landscape game: requests a native orientation lock where supported
 * (Android — the real viewport rotates and the landscape board renders natively), and
 * otherwise rotates the app with CSS (iOS). When the CSS fallback is active it sets
 * `forcedLandscape` so the layout renders the landscape board on a portrait viewport.
 * No-op on tablets and desktops.
 */
export function useForceLandscape(): void {
  const setForcedLandscape = useGameStore((state) => state.setForcedLandscape);

  useEffect(() => {
    if (!isPhone()) return undefined;
    const root = document.documentElement;
    const portrait = window.matchMedia('(orientation: portrait)');

    const sync = () => {
      // Still portrait after attempting the native lock => unsupported (iOS): CSS-rotate.
      const cssRotated = portrait.matches;
      root.classList.toggle('force-landscape', cssRotated);
      setForcedLandscape(cssRotated);
    };

    tryLockLandscape();
    sync();
    portrait.addEventListener('change', sync);
    return () => {
      portrait.removeEventListener('change', sync);
      root.classList.remove('force-landscape');
      setForcedLandscape(false);
    };
  }, [setForcedLandscape]);
}
