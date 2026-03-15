'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Circle, CheckCircle2, Calendar, Flag } from 'lucide-react';
import { toggleTaskAction, createTaskAction } from '@/app/actions';
import { cn } from '@/lib/cn';
import { PRIORITY_COLORS } from '@/lib/constants';
import { formatISODate } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  dueDate: string | null;
  scheduledDate: string | null;
  projectId: string | null;
}

interface TaskListProps {
  tasks: Task[];
  showAddButton?: boolean;
  emptyMessage?: string;
}

export function TaskList({ tasks, showAddButton = true, emptyMessage = 'No tasks' }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    const formData = new FormData();
    formData.set('title', newTaskTitle.trim());
    await createTaskAction(formData);
    setNewTaskTitle('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-0.5">
      {tasks.length === 0 && !isAdding && (
        <p className="py-4 text-center text-sm text-text-muted">{emptyMessage}</p>
      )}

      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}

      {isAdding && (
        <div className="flex items-center gap-2 py-1.5 pl-1">
          <Circle size={18} className="text-text-muted flex-shrink-0" />
          <input
            autoFocus
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
              if (e.key === 'Escape') { setIsAdding(false); setNewTaskTitle(''); }
            }}
            onBlur={() => {
              if (newTaskTitle.trim()) handleAddTask();
              else { setIsAdding(false); setNewTaskTitle(''); }
            }}
            placeholder="Task title..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
          />
        </div>
      )}

      {showAddButton && !isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-sm text-text-muted hover:text-text-secondary hover:bg-surface-1 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          <span>Add task</span>
        </button>
      )}
    </div>
  );
}

function TaskItem({ task }: { task: Task }) {
  const [isToggling, setIsToggling] = useState(false);
  const isDone = task.status === 'done';

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsToggling(true);
    await toggleTaskAction(task.id);
    setIsToggling(false);
  };

  return (
    <Link href={`/tasks/${task.id}`}>
      <div
        className={cn(
          'group flex items-center gap-2 rounded-md px-1 py-1.5 transition-colors hover:bg-surface-1',
          isToggling && 'opacity-50'
        )}
      >
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className="flex-shrink-0 text-text-muted hover:text-brand-500 transition-colors"
        >
          {isDone ? (
            <CheckCircle2 size={18} className="text-status-success" />
          ) : (
            <Circle size={18} />
          )}
        </button>

        <span
          className={cn(
            'flex-1 text-sm',
            isDone && 'line-through text-text-muted'
          )}
        >
          {task.title}
        </span>

        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.priority && (
            <Flag size={14} className={PRIORITY_COLORS[task.priority] || 'text-text-muted'} />
          )}
          {task.dueDate && (
            <span className="text-2xs text-text-tertiary flex items-center gap-0.5">
              <Calendar size={12} />
              {formatISODate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
