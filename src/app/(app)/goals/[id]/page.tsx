import { notFound } from 'next/navigation';
import { getGoal, getGoalHabits } from '@/server/services/goals';
import { getRelationsForItem } from '@/server/services/relations';
import { getTagsForItem } from '@/server/services/tags';
import { GoalDetailClient } from './client';

export const metadata = { title: 'Goal — lifeOS' };
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GoalDetailPage({ params }: Props) {
  const { id } = await params;
  const goal = getGoal(id);
  if (!goal) notFound();

  const habits = getGoalHabits(id);
  const relations = getRelationsForItem('goal', id);
  const tags = getTagsForItem('goal', id);

  const relatedItems = relations.map((rel) => {
    const isSource = rel.sourceType === 'goal' && rel.sourceId === id;
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
    <GoalDetailClient
      goal={goal}
      habits={habits}
      relatedItems={relatedItems}
      tags={tags}
    />
  );
}
