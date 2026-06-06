import { Download } from 'lucide-react';
import { rulesContent, downloadRulesPdf } from '../../application/rulesContent';
import { useGameStore } from '../../store/useGameStore';
import { translations } from '../../i18n/translations';

export const RulesDetailPage = () => {
  const language = useGameStore((state) => state.language);
  const t = translations[language];
  const sections = rulesContent(language);

  return (
    <section className="grid gap-3 rounded-xl border border-token-soft p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="modal-h2">{t.common.rulesExamples}</h3>
        <button
          type="button"
          onClick={() => downloadRulesPdf(language)}
          className="surface-control inline-flex min-h-11 items-center gap-2 rounded-full border px-3 py-2 text-xs font-black"
        >
          <Download size={14} />
          {t.common.downloadPdf}
        </button>
      </div>
      {sections.map((section) => (
        <details key={section.title} open className="surface-muted rounded-lg border border-token-soft px-3 py-2">
          <summary className="cursor-pointer font-display font-black text-brass">{section.title}</summary>
          <div className="mt-2 grid gap-2 text-sm">
            {section.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </details>
      ))}
    </section>
  );
};
