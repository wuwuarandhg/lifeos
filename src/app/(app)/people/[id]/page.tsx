import { notFound } from 'next/navigation';
import { getEntity } from '@/server/services/entities';
import { getRelationsForItem } from '@/server/services/relations';
import { getTagsForItem } from '@/server/services/tags';
import { PersonDetailClient } from './client';

export const metadata = { title: 'Person — lifeOS' };
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PersonDetailPage({ params }: Props) {
  const { id } = await params;
  const entity = getEntity(id);
  if (!entity || entity.entityType !== 'person') notFound();

  const relations = getRelationsForItem('entity', id);
  const tags = getTagsForItem('entity', id);

  const relatedItems = relations.map((rel) => {
    const isSource = rel.sourceType === 'entity' && rel.sourceId === id;
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
    <PersonDetailClient
      entity={entity}
      relatedItems={relatedItems}
      tags={tags}
    />
  );
}
