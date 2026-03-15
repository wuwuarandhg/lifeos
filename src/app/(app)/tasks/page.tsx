import { getAllTasks, getCompletedTasks } from '@/server/services/tasks';
import { TaskList } from '@/components/tasks/task-list';

export const metadata = { title: 'Tasks — lifeOS' };
export const dynamic = 'force-dynamic';

export default function TasksPage() {
  const activeTasks = getAllTasks();
  const todoTasks = activeTasks.filter(t => t.status === 'todo' || t.status === 'in_progress');
  const inboxTasks = activeTasks.filter(t => t.status === 'inbox');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Tasks</h1>
        <span className="text-sm text-text-tertiary">
          {todoTasks.length} active
        </span>
      </div>

      {inboxTasks.length > 0 && (
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">
            Inbox ({inboxTasks.length})
          </h2>
          <TaskList tasks={inboxTasks} showAddButton={false} />
        </div>
      )}

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">To Do</h2>
        <TaskList tasks={todoTasks} showAddButton={true} emptyMessage="All clear! Add a task to get started." />
      </div>
    </div>
  );
}
