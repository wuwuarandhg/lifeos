import { notFound } from 'next/navigation';
import { getIdea } from '@/server/services/ideas';
import { getRelationsForItem } from '@/server/services/relations';
import { getTagsForItem } from '@/server/services/tags';
import { IdeaDetailClient } from './client';

export const metadata = { title: 'Idea — lifeOS' };
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function IdeaDetailPage({ params }: Props) {
  const { id } = await params;
  const idea = getIdea(id);
  if (!idea) notFound();

  const relations = getRelationsForItem('idea', id);
  const tags = getTagsForItem('idea', id);

  const relatedItems = relations.map((rel) => {
    const isSource = rel.sourceType === 'idea' && rel.sourceId === id;
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
    <IdeaDetailClient
      idea={idea}
      relatedItems={relatedItems}
      tags={tags}
    />
  );
}
