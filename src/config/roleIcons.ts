import { Cpu, Crown, Eye, Newspaper, ShieldAlert, type LucideIcon } from 'lucide-react';
import type { RoleId } from '../domain/game/types';

export const roleIcon: Record<RoleId, LucideIcon> = {
  leader: Crown,
  officer: ShieldAlert,
  thief: Cpu,
  helper: Eye,
  reporter: Newspaper,
};
