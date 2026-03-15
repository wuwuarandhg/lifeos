import Link from 'next/link';
import { formatISODate } from '@/lib/utils';
import { MOOD_LABELS } from '@/lib/constants';
import { cn } from '@/lib/cn';

interface JournalEntry {
  id: string;
  title: string | null;
  body: string | null;
  entryDate: string;
  entryTime: string | null;
  entryType: string | null;
  mood: number | null;
  energy: number | null;
  wordCount: number | null;
}

export function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  const preview = entry.body
    ? entry.body.length > 200
      ? entry.body.slice(0, 200) + '...'
      : entry.body
    : null;

  return (
    <Link href={`/journal/${entry.id}`}>
      <div className="card group hover:border-brand-200 cursor-pointer transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {entry.title && (
            <h3 className="text-sm font-medium text-text-primary">{entry.title}</h3>
          )}
          <div className="flex items-center gap-2 text-2xs text-text-tertiary">
            <span>{formatISODate(entry.entryDate)}</span>
            {entry.entryTime && <span>at {entry.entryTime}</span>}
            {entry.entryType && entry.entryType !== 'freeform' && (
              <span className="badge bg-surface-2 text-text-tertiary">{entry.entryType}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {entry.mood && (
            <div className="text-right">
              <div className="text-2xs text-text-muted">Mood</div>
              <div className={cn(
                'text-sm font-semibold',
                entry.mood >= 7 ? 'text-status-success' :
                entry.mood >= 4 ? 'text-text-secondary' :
                'text-status-danger'
              )}>
                {entry.mood}/10
              </div>
            </div>
          )}
          {entry.energy && (
            <div className="text-right">
              <div className="text-2xs text-text-muted">Energy</div>
              <div className={cn(
                'text-sm font-semibold',
                entry.energy >= 7 ? 'text-status-success' :
                entry.energy >= 4 ? 'text-text-secondary' :
                'text-status-danger'
              )}>
                {entry.energy}/10
              </div>
            </div>
          )}
        </div>
      </div>

      {preview && (
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          {preview}
        </p>
      )}

      {entry.wordCount ? (
        <div className="mt-2 text-2xs text-text-muted">
          {entry.wordCount} words
        </div>
      ) : null}
      </div>
    </Link>
  );
}
