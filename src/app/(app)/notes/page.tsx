import Link from 'next/link';
import { getAllNotes } from '@/server/services/notes';
import { CreateNoteButton } from '@/components/notes/create-note-button';
import { formatDate } from '@/lib/utils';
import { StickyNote } from 'lucide-react';
import { buildPageMetadata, getCurrentLocale } from '@/lib/locale-server';
import { translateText } from '@/lib/i18n';

export async function generateMetadata() {
  return buildPageMetadata('Notes');
}
export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const locale = await getCurrentLocale();
  const tx = (text: string) => translateText(text, locale);
  const allNotes = getAllNotes();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">{tx('Notes')}</h1>
        <CreateNoteButton />
      </div>

      {allNotes.length === 0 ? (
        <div className="card py-12 text-center">
          <StickyNote size={32} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-muted">{tx('No notes yet.')}</p>
          <p className="text-2xs text-text-muted mt-1">{tx('Create your first note to get started.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allNotes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <div className="card hover:border-brand-200 cursor-pointer transition-colors">
                <h3 className="text-sm font-medium text-text-primary truncate">{note.title}</h3>
                {note.body && (
                  <p className="mt-1 text-2xs text-text-tertiary line-clamp-3">
                    {note.body.slice(0, 150)}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  {note.noteType && note.noteType !== 'note' && (
                    <span className="badge bg-surface-2 text-text-tertiary text-2xs">
                      {note.noteType}
                    </span>
                  )}
                  <span className="text-2xs text-text-muted">
                    {formatDate(note.updatedAt, locale)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
