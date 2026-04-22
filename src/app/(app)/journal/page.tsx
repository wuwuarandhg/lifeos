import { getAllJournalEntries } from '@/server/services/journal';
import { JournalEntryCard } from '@/components/journal/journal-entry-card';
import { QuickJournalForm } from '@/components/journal/quick-journal-form';
import { buildPageMetadata, getCurrentLocale } from '@/lib/locale-server';
import { formatEntryCount, translateText } from '@/lib/i18n';

export async function generateMetadata() {
  return buildPageMetadata('Journal');
}
export const dynamic = 'force-dynamic';

export default async function JournalPage() {
  const locale = await getCurrentLocale();
  const tx = (text: string) => translateText(text, locale);
  const entries = getAllJournalEntries();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">{tx('Journal')}</h1>
        <span className="text-sm text-text-tertiary">
          {formatEntryCount(locale, entries.length)}
        </span>
      </div>

      <QuickJournalForm />

      <div className="space-y-3">
        {entries.length === 0 && (
          <div className="card py-8 text-center">
            <p className="text-sm text-text-muted">{tx('No journal entries yet.')}</p>
            <p className="text-2xs text-text-muted mt-1">{tx('Write your first entry above.')}</p>
          </div>
        )}
        {entries.map((entry) => (
          <JournalEntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
