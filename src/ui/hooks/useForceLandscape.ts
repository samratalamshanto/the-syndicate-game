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

const orientationApi = () =>
  window.screen?.orientation as
    | (ScreenOrientation & { lock?: (orientation: string) => Promise<void>; unlock?: () => void })
    | undefined;

const tryLockLandscape = (): void => {
  // Works on most Android browsers; unsupported on iOS Safari, where the CSS fallback covers it.
  orientationApi()?.lock?.('landscape').catch(() => {});
};

const tryUnlock = (): void => {
  try {
    orientationApi()?.unlock?.();
  } catch {
    // ignore — not all browsers support unlock
  }
};

/**
 * Gives phones a landscape game while `active` (a match is in progress): requests a native
 * orientation lock where supported (Android — the real viewport rotates and the landscape
 * board renders natively), and otherwise rotates the app with CSS (iOS), setting
 * `forcedLandscape` so the layout renders the landscape board on a portrait viewport.
 * Setup and menus stay upright. No-op on tablets and desktops.
 */
export function useForceLandscape(active: boolean): void {
  const setForcedLandscape = useGameStore((state) => state.setForcedLandscape);

  useEffect(() => {
    const root = document.documentElement;
    const clear = () => {
      root.classList.remove('force-landscape');
      setForcedLandscape(false);
    };

    if (!isPhone() || !active) {
      clear();
      tryUnlock();
      return undefined;
    }

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
      clear();
      tryUnlock();
    };
  }, [active, setForcedLandscape]);
}
