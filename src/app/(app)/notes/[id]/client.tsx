'use client';

import { useRouter } from 'next/navigation';
import { DetailPageShell } from '@/components/detail/detail-page-shell';
import { EditableField } from '@/components/detail/editable-field';
import { StatusBadge } from '@/components/detail/status-badge';
import { TagsPills } from '@/components/detail/tags-pills';
import { RelationsPanel } from '@/components/detail/relations-panel';
import { updateNoteAction, archiveNoteAction } from '@/app/actions';
import { formatDate } from '@/lib/utils';

interface Note {
  id: string;
  title: string;
  body: string | null;
  noteType: string | null;
  collection: string | null;
  isPinned: number | null;
  createdAt: number;
  updatedAt: number;
}

interface Tag {
  id: string;
  name: string;
  color: string | null;
  itemTagId: string;
}

interface RelatedItem {
  relation: {
    id: string;
    sourceType: string;
    sourceId: string;
    targetType: string;
    targetId: string;
    relationType: string;
  };
  type: string;
  id: string;
  title: string;
  direction: 'outgoing' | 'incoming';
}

const NOTE_TYPE_OPTIONS = [
  { value: 'note', label: 'Note' },
  { value: 'reference', label: 'Reference' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'snippet', label: 'Snippet' },
  { value: 'evergreen', label: 'Evergreen' },
];

interface NoteDetailClientProps {
  note: Note;
  relatedItems: RelatedItem[];
  tags: Tag[];
}

export function NoteDetailClient({
  note,
  relatedItems,
  tags,
}: NoteDetailClientProps) {
  const router = useRouter();

  const handleUpdate = async (field: string, value: unknown) => {
    await updateNoteAction(note.id, { [field]: value });
  };

  const handleArchive = async () => {
    await archiveNoteAction(note.id);
    router.push('/notes');
  };

  return (
    <DetailPageShell
      backHref="/notes"
      backLabel="Notes"
      title={note.title}
      onTitleChange={(title) => handleUpdate('title', title)}
      badge={
        note.noteType && note.noteType !== 'note' ? (
          <StatusBadge status={note.noteType} />
        ) : undefined
      }
      onArchive={handleArchive}
    >
      {/* Metadata */}
      <div className="card">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <EditableField
            label="Type"
            value={note.noteType}
            onSave={(v) => handleUpdate('noteType', v)}
            type="select"
            options={NOTE_TYPE_OPTIONS}
          />
          <EditableField
            label="Collection"
            value={note.collection}
            onSave={(v) => handleUpdate('collection', v)}
            placeholder="Folder or group name..."
          />
          <div className="space-y-0.5">
            <span className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              Created
            </span>
            <p className="text-sm text-text-primary">{formatDate(note.createdAt)}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              Updated
            </span>
            <p className="text-sm text-text-primary">{formatDate(note.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="card">
        <EditableField
          label="Content"
          value={note.body}
          onSave={(v) => handleUpdate('body', v)}
          type="textarea"
          placeholder="Write your note..."
          emptyLabel="Start writing..."
        />
      </div>

      {/* Tags */}
      <div className="card">
        <h3 className="text-2xs font-medium uppercase tracking-wider text-text-muted mb-2">Tags</h3>
        <TagsPills itemType="note" itemId={note.id} tags={tags} />
      </div>

      {/* Relations */}
      <RelationsPanel items={relatedItems} />
    </DetailPageShell>
  );
}
