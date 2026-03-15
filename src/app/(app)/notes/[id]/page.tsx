import { notFound } from 'next/navigation';
import { getNote } from '@/server/services/notes';
import { getRelationsForItem } from '@/server/services/relations';
import { getTagsForItem } from '@/server/services/tags';
import { NoteDetailClient } from './client';

export const metadata = { title: 'Note — lifeOS' };
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NoteDetailPage({ params }: Props) {
  const { id } = await params;
  const note = getNote(id);
  if (!note) notFound();

  const relations = getRelationsForItem('note', id);
  const tags = getTagsForItem('note', id);

  const relatedItems = relations.map((rel) => {
    const isSource = rel.sourceType === 'note' && rel.sourceId === id;
    const otherType = isSource ? rel.targetType : rel.sourceType;
    const otherId = isSource ? rel.targetId : rel.sourceId;
    return {
      relation: rel,
      type: otherType,
      id: otherId,
      title: `${otherType} ${otherId.slice(0, 8)}...`,
      direction: isSource ? 'outgoing' as const : 'incoming' as const,
    };
  });

  return (
    <NoteDetailClient
      note={note}
      relatedItems={relatedItems}
      tags={tags}
    />
  );
}
