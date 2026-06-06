import { ArrowDown, ArrowRight, BadgeHelp, Coins, ShieldX } from 'lucide-react';
import { roleOrder } from '../../config/branding';
import { formatMessage, translations } from '../../i18n/translations';
import { useGameStore } from '../../store/useGameStore';

type Props = {
  compact?: boolean;
};

export const GuidePanel = ({ compact = false }: Props) => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];

  return (
    <section className="rounded-lg border border-ink/10 bg-white/75 p-4 shadow-card dark:border-paper/10 dark:bg-white/10">
      <div className="flex items-center gap-2 text-brass">
        <BadgeHelp size={18} />
        <h2 className="font-display text-xl font-black">{t.guide.title}</h2>
      </div>
      <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">{t.guide.intro}</p>

      <div className="mt-4 grid gap-3">
        <div className="flex flex-col items-stretch gap-2 text-center text-xs font-bold sm:grid sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <span className="rounded-md bg-ink px-2 py-2 text-paper dark:bg-paper dark:text-night">Action</span>
          <ArrowDown size={16} className="mx-auto sm:hidden" />
          <ArrowRight size={16} className="mx-auto hidden sm:block" />
          <span className="rounded-md bg-brass px-2 py-2 text-night">Challenge</span>
          <ArrowDown size={16} className="mx-auto sm:hidden" />
          <ArrowRight size={16} className="mx-auto hidden sm:block" />
          <span className="rounded-md bg-jade px-2 py-2 text-white">Resolve</span>
        </div>
        <p className="text-sm">{t.guide.turn}</p>
        <p className="text-sm">{t.guide.challenge}</p>
        <div className="grid gap-2 rounded-md bg-ink/5 p-3 text-sm dark:bg-paper/10">
          <div className="flex items-center gap-2 font-bold">
            <Coins size={16} />
            {t.guide.money}
          </div>
          <div className="flex items-center gap-2 font-bold text-ember">
            <ShieldX size={16} />
            {formatMessage(t.guide.doubleLoss, { officer: t.roles.officer.name })}
          </div>
        </div>
      </div>

      {!compact ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {roleOrder.map((role) => (
            <div key={role} className="rounded-md border border-ink/10 p-3 text-sm dark:border-paper/10">
              <p className="font-display font-bold">{t.roles[role].name}</p>
              <p className="text-ink/70 dark:text-paper/70">{t.roles[role].power}</p>
              <p className="text-brass">{t.roles[role].counter}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};
