import type { RoleId } from '../../domain/game/types';
import { roleColors } from '../../config/branding';
import { roleIcon } from '../../config/roleIcons';

type Props = {
  role: RoleId;
  compact?: boolean;
  fill?: boolean;
};

const roleImages: Record<RoleId, { src: string; position: string }> = {
  leader: { src: './assets/roles/ceo.jpeg', position: '70% 28%' },
  officer: { src: './assets/roles/minister.jpeg', position: '50% 35%' },
  thief: { src: './assets/roles/hacker.jpeg', position: '50% 38%' },
  helper: { src: './assets/roles/spy.jpeg', position: '50% 35%' },
  reporter: { src: './assets/roles/journalist.jpeg', position: '50% 35%' },
};

export const RolePortrait = ({ role, compact = false, fill = false }: Props) => {
  const image = roleImages[role];
  const Icon = roleIcon[role];
  const containerSize = fill
    ? 'h-full w-full'
    : compact
      ? 'h-14 w-14'
      : 'h-40 w-full';

  if (compact) {
    return (
      <div className={`relative grid ${containerSize} place-items-center overflow-hidden rounded-lg bg-gradient-to-br ${roleColors[role]}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
        <Icon size={28} className="relative text-white drop-shadow" />
      </div>
    );
  }

  return (
    <div className={`surface-muted relative overflow-hidden rounded-lg ${containerSize}`}>
      <img
        alt=""
        aria-hidden="true"
        className="portrait-mask h-full w-full scale-[1.45] object-cover saturate-[1.15] contrast-[1.05]"
        src={image.src}
        style={{ objectPosition: image.position }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-white/10" />
      <div className="absolute inset-0 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_40%)]" />
    </div>
  );
};
