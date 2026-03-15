'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProjectAction } from '@/app/actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createProjectAction(formData);

    if (result?.project) {
      router.push(`/projects/${result.project.id}`);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/projects"
        className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Projects
      </Link>

      <h1 className="text-2xl font-semibold text-text-primary">New Project</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">
            Title <span className="text-status-danger">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            autoFocus
            placeholder="Project name..."
            className="capture-bar"
          />
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-text-secondary mb-1">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={2}
            placeholder="Brief description..."
            className="capture-bar resize-y"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-1">
              Status
            </label>
            <select id="status" name="status" defaultValue="planning" className="capture-bar">
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-text-secondary mb-1">
              Start Date
            </label>
            <input id="startDate" name="startDate" type="date" className="capture-bar" />
          </div>

          <div>
            <label htmlFor="targetDate" className="block text-sm font-medium text-text-secondary mb-1">
              Target Date
            </label>
            <input id="targetDate" name="targetDate" type="date" className="capture-bar" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
          <Link
            href="/projects"
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-muted hover:bg-surface-2 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
