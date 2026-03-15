import { getAllProjects, getProjectTasks } from '@/server/services/projects';
import { StatusBadge } from '@/components/detail/status-badge';
import { ProgressBar } from '@/components/detail/progress-bar';
import Link from 'next/link';
import { FolderKanban, Plus, Calendar, CheckSquare } from 'lucide-react';
import { formatISODate } from '@/lib/utils';

export const metadata = { title: 'Projects — lifeOS' };
export const dynamic = 'force-dynamic';

const STATUS_ORDER = ['active', 'planning', 'paused', 'completed', 'cancelled'] as const;

export default function ProjectsPage() {
  const allProjects = getAllProjects();

  // Group by status
  const grouped = STATUS_ORDER.map((status) => ({
    status,
    projects: allProjects.filter((p) => p.status === status),
  })).filter((g) => g.projects.length > 0);

  const activeCount = allProjects.filter(
    (p) => p.status === 'active' || p.status === 'planning'
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Projects</h1>
          <p className="text-sm text-text-tertiary">{activeCount} active</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} />
          New Project
        </Link>
      </div>

      {allProjects.length === 0 ? (
        <div className="card py-12 text-center">
          <FolderKanban size={32} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-muted">No projects yet.</p>
          <p className="text-2xs text-text-muted mt-1">
            Create your first project to start organizing your work.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ status, projects }) => (
            <div key={status}>
              <div className="mb-3 flex items-center gap-2">
                <StatusBadge status={status} />
                <span className="text-2xs text-text-muted">
                  {projects.length} project{projects.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
}: {
  project: ReturnType<typeof getAllProjects>[number];
}) {
  const tasks = getProjectTasks(project.id);
  const doneTasks = tasks.filter((t) => t.status === 'done').length;

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="card hover:border-brand-200 cursor-pointer transition-all group">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-medium text-text-primary group-hover:text-brand-600 transition-colors truncate">
            {project.title}
          </h3>
          {project.health && (
            <StatusBadge status={project.health} />
          )}
        </div>

        {project.summary && (
          <p className="text-2xs text-text-tertiary line-clamp-2 mb-3">
            {project.summary}
          </p>
        )}

        <ProgressBar value={project.progress ?? 0} className="mb-3" />

        <div className="flex items-center gap-3 text-2xs text-text-muted">
          {tasks.length > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare size={11} />
              {doneTasks}/{tasks.length}
            </span>
          )}
          {project.targetDate && (
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatISODate(project.targetDate)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
