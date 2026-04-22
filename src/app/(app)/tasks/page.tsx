import { getAllTasks, getCompletedTasks } from '@/server/services/tasks';
import { TaskList } from '@/components/tasks/task-list';
import { buildPageMetadata, getCurrentLocale } from '@/lib/locale-server';
import { formatActiveCount, translateText } from '@/lib/i18n';

export async function generateMetadata() {
  return buildPageMetadata('Tasks');
}
export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const locale = await getCurrentLocale();
  const tx = (text: string) => translateText(text, locale);
  const activeTasks = getAllTasks();
  const todoTasks = activeTasks.filter(t => t.status === 'todo' || t.status === 'in_progress');
  const inboxTasks = activeTasks.filter(t => t.status === 'inbox');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">{tx('Tasks')}</h1>
        <span className="text-sm text-text-tertiary">
          {formatActiveCount(locale, todoTasks.length)}
        </span>
      </div>

      {inboxTasks.length > 0 && (
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">
            {tx('Inbox')} ({inboxTasks.length})
          </h2>
          <TaskList tasks={inboxTasks} showAddButton={false} />
        </div>
      )}

      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-text-primary">{tx('To Do')}</h2>
        <TaskList tasks={todoTasks} showAddButton={true} emptyMessage={tx('All clear! Add a task to get started.')} />
      </div>
    </div>
  );
}
