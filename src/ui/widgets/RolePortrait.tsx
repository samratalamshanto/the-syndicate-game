import type { RoleId } from '../../domain/game/types';

type Props = {
  role: RoleId;
  compact?: boolean;
  fill?: boolean;
};

const roleImages: Record<RoleId, { src: string; position: string }> = {
  leader: { src: './assets/roles/ceo.jpeg', position: '50% 42%' },
  officer: { src: './assets/roles/minister.jpeg', position: '50% 46%' },
  thief: { src: './assets/roles/hacker.jpeg', position: '50% 44%' },
  helper: { src: './assets/roles/spy.jpeg', position: '50% 44%' },
  reporter: { src: './assets/roles/journalist.jpeg', position: '50% 44%' },
};

export const RolePortrait = ({ role, compact = false, fill = false }: Props) => {
  const image = roleImages[role];
  const containerSize = fill
    ? 'h-full w-full'
    : compact
      ? 'h-14 w-14'
      : 'h-40 w-full';

  return (
    <div className={`relative overflow-hidden rounded-lg bg-black/30 ${containerSize}`}>
      <img
        alt=""
        aria-hidden="true"
        className="h-full w-full scale-[1.18] object-cover saturate-[1.15] contrast-[1.05]"
        src={image.src}
        style={{ objectPosition: image.position }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-white/10" />
      <div className="absolute inset-0 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_40%)]" />
    </div>
  );
};
