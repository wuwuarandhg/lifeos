import { notFound } from 'next/navigation';
import { getProject, getProjectTasks } from '@/server/services/projects';
import { getRelationsForItem } from '@/server/services/relations';
import { getTagsForItem } from '@/server/services/tags';
import { formatDate, formatISODate } from '@/lib/utils';
import { ProjectDetailClient } from './client';

export const metadata = { title: 'Project — lifeOS' };
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const tasks = getProjectTasks(id);
  const relations = getRelationsForItem('project', id);
  const tags = getTagsForItem('project', id);

  // Resolve related item titles for the relations panel
  const relatedItems = relations.map((rel) => {
    const isSource = rel.sourceType === 'project' && rel.sourceId === id;
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
    <ProjectDetailClient
      project={project}
      tasks={tasks}
      relatedItems={relatedItems}
      tags={tags}
    />
  );
}
