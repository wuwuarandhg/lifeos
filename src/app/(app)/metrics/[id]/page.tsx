import { notFound } from 'next/navigation';
import { getMetric } from '@/server/services/metrics';
import { getRelationsForItem } from '@/server/services/relations';
import { getTagsForItem } from '@/server/services/tags';
import { MetricDetailClient } from './client';

export const metadata = { title: 'Metric — lifeOS' };
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MetricDetailPage({ params }: Props) {
  const { id } = await params;
  const metric = getMetric(id);
  if (!metric) notFound();

  const relations = getRelationsForItem('metric', id);
  const tags = getTagsForItem('metric', id);

  const relatedItems = relations.map((rel) => {
    const isSource = rel.sourceType === 'metric' && rel.sourceId === id;
    const otherType = isSource ? rel.targetType : rel.sourceType;
    const otherId = isSource ? rel.targetId : rel.sourceId;
    return {
      relation: rel,
      type: otherType,
      id: otherId,
      title: `${otherType} ${otherId.slice(0, 8)}...`,
      direction: isSource ? ('outgoing' as const) : ('incoming' as const),
    };
  });

  return (
    <MetricDetailClient
      metric={metric}
      relatedItems={relatedItems}
      tags={tags}
    />
  );
}
