import { notFound } from 'next/navigation';
import { getTask } from '@/server/services/tasks';
import { getProject } from '@/server/services/projects';
import { getRelationsForItem } from '@/server/services/relations';
import { getTagsForItem } from '@/server/services/tags';
import { TaskDetailClient } from './client';

export const metadata = { title: 'Task — lifeOS' };
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;
  const task = getTask(id);
  if (!task) notFound();

  const project = task.projectId ? getProject(task.projectId) : null;
  const relations = getRelationsForItem('task', id);
  const tags = getTagsForItem('task', id);

  const relatedItems = relations.map((rel) => {
    const isSource = rel.sourceType === 'task' && rel.sourceId === id;
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
    <TaskDetailClient
      task={task}
      project={project}
      relatedItems={relatedItems}
      tags={tags}
    />
  );
}
