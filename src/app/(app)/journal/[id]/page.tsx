import { notFound } from 'next/navigation';
import { getJournalEntry } from '@/server/services/journal';
import { getRelationsForItem } from '@/server/services/relations';
import { getTagsForItem } from '@/server/services/tags';
import { JournalDetailClient } from './client';

export const metadata = { title: 'Journal Entry — lifeOS' };
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JournalDetailPage({ params }: Props) {
  const { id } = await params;
  const entry = getJournalEntry(id);
  if (!entry) notFound();

  const relations = getRelationsForItem('journal', id);
  const tags = getTagsForItem('journal', id);

  const relatedItems = relations.map((rel) => {
    const isSource = rel.sourceType === 'journal' && rel.sourceId === id;
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
    <JournalDetailClient
      entry={entry}
      relatedItems={relatedItems}
      tags={tags}
    />
  );
}
