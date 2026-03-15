import { getAllJournalEntries } from '@/server/services/journal';
import { JournalEntryCard } from '@/components/journal/journal-entry-card';
import { QuickJournalForm } from '@/components/journal/quick-journal-form';

export const metadata = { title: 'Journal — lifeOS' };
export const dynamic = 'force-dynamic';

export default function JournalPage() {
  const entries = getAllJournalEntries();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Journal</h1>
        <span className="text-sm text-text-tertiary">
          {entries.length} entries
        </span>
      </div>

      <QuickJournalForm />

      <div className="space-y-3">
        {entries.length === 0 && (
          <div className="card py-8 text-center">
            <p className="text-sm text-text-muted">No journal entries yet.</p>
            <p className="text-2xs text-text-muted mt-1">Write your first entry above.</p>
          </div>
        )}
        {entries.map((entry) => (
          <JournalEntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
