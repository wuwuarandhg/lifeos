'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGoalAction } from '@/app/actions';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewGoalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createGoalAction(formData);

    if (result?.goal) {
      router.push(`/goals/${result.goal.id}`);
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href="/goals"
        className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Goals
      </Link>

      <h1 className="text-2xl font-semibold text-text-primary">New Goal</h1>

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
            placeholder="What do you want to achieve?"
            className="capture-bar"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            placeholder="Why does this goal matter?"
            className="capture-bar resize-y"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="timeHorizon" className="block text-sm font-medium text-text-secondary mb-1">
              Time Horizon
            </label>
            <select id="timeHorizon" name="timeHorizon" defaultValue="quarterly" className="capture-bar">
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
              <option value="multi_year">Multi-Year</option>
              <option value="life">Life</option>
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

        <div>
          <label htmlFor="outcomeMetric" className="block text-sm font-medium text-text-secondary mb-1">
            Outcome Metric
          </label>
          <input
            id="outcomeMetric"
            name="outcomeMetric"
            type="text"
            placeholder="e.g., Run a marathon, Save $10k, Read 30 books"
            className="capture-bar"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Goal'}
          </button>
          <Link
            href="/goals"
            className="rounded-lg px-4 py-2 text-sm font-medium text-text-muted hover:bg-surface-2 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
