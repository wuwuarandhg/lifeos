import { notFound } from 'next/navigation';
import { getHabit, getHabitCompletions } from '@/server/services/habits';
import { getGoal } from '@/server/services/goals';
import { getProject } from '@/server/services/projects';
import { getRelationsForItem } from '@/server/services/relations';
import { getTagsForItem } from '@/server/services/tags';
import { todayISO, startOfWeek } from '@/lib/utils';
import { HabitDetailClient } from './client';

export const metadata = { title: 'Habit — lifeOS' };
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function HabitDetailPage({ params }: Props) {
  const { id } = await params;
  const habit = getHabit(id);
  if (!habit) notFound();

  const goal = habit.goalId ? getGoal(habit.goalId) : null;
  const project = habit.projectId ? getProject(habit.projectId) : null;

  // Get last 30 days of completions
  const today = todayISO();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const completions = getHabitCompletions(id, startDate, today);

  const relations = getRelationsForItem('habit', id);
  const tags = getTagsForItem('habit', id);

  const relatedItems = relations.map((rel) => {
    const isSource = rel.sourceType === 'habit' && rel.sourceId === id;
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
    <HabitDetailClient
      habit={habit}
      goal={goal}
      project={project}
      completions={completions}
      relatedItems={relatedItems}
      tags={tags}
    />
  );
}
