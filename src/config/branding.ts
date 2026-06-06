import type { RoleId } from '../domain/game/types';

export type BrandMode = 'syndicate' | 'daily';

export const brandMode: BrandMode =
  import.meta.env.VITE_BRAND_MODE === 'daily' ? 'daily' : 'syndicate';

export const roleOrder: RoleId[] = ['leader', 'officer', 'thief', 'helper', 'reporter'];

export const roleColors: Record<RoleId, string> = {
  leader: 'from-sky-900 to-blue-600',
  officer: 'from-red-950 to-red-600',
  thief: 'from-teal-950 to-cyan-600',
  helper: 'from-emerald-950 to-lime-600',
  reporter: 'from-amber-900 to-orange-500',
};

export const roleSymbols: Record<RoleId, string> = {
  leader: 'L',
  officer: 'P',
  thief: 'T',
  helper: 'H',
  reporter: 'R',
};
