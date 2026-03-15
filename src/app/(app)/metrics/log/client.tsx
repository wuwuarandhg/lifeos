'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createMetricAction } from '@/app/actions';
import {
  METRIC_TYPE_LABELS,
  METRIC_TYPE_ICONS,
  MOOD_LABELS,
  ENERGY_LABELS,
  WORKOUT_TYPES,
  EXPENSE_CATEGORIES,
} from '@/lib/constants';
import type { MetricType } from '@/lib/types';

const LOGGABLE_TYPES: MetricType[] = ['sleep', 'mood', 'energy', 'workout', 'expense'];

export function MetricLogClient() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<MetricType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (formData: FormData) => {
    if (!selectedType) return;
    setSubmitting(true);

    formData.set('metricType', selectedType);
    const result = await createMetricAction(formData);
    if (result && !('error' in result)) {
      router.push('/metrics');
    }
    setSubmitting(false);
  };

  if (!selectedType) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link
            href="/metrics"
            className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        <h1 className="text-2xl font-semibold text-text-primary">Log a Metric</h1>
        <p className="text-sm text-text-tertiary">What do you want to log?</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {LOGGABLE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className="card flex flex-col items-center gap-2 p-4 transition-colors hover:bg-surface-2 hover:border-brand-primary"
            >
              <span className="text-2xl">{METRIC_TYPE_ICONS[type]}</span>
              <span className="text-sm font-medium text-text-primary">
                {METRIC_TYPE_LABELS[type]}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedType(null)}
          className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Change type
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-2xl">{METRIC_TYPE_ICONS[selectedType]}</span>
        <h1 className="text-2xl font-semibold text-text-primary">
          Log {METRIC_TYPE_LABELS[selectedType]}
        </h1>
      </div>

      <form action={handleSubmit} className="card space-y-4 p-4">
        {/* Date */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Date</label>
          <input
            type="date"
            name="loggedDate"
            defaultValue={today}
            className="w-full rounded-lg border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary"
          />
        </div>

        {/* Type-specific fields */}
        {selectedType === 'sleep' && <SleepFields />}
        {selectedType === 'mood' && <MoodFields />}
        {selectedType === 'energy' && <EnergyFields />}
        {selectedType === 'workout' && <WorkoutFields />}
        {selectedType === 'expense' && <ExpenseFields />}

        {/* Note */}
        <div>
          <label className="mb-1 block text-xs font-medium text-text-secondary">Note (optional)</label>
          <textarea
            name="note"
            rows={2}
            placeholder="Any additional context..."
            className="w-full rounded-lg border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// Type-specific field sets
// ============================================================

function SleepFields() {
  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Hours slept</label>
        <input
          type="number"
          name="valueNumeric"
          step="0.5"
          min="0"
          max="24"
          placeholder="7.5"
          required
          className="w-full rounded-lg border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary"
        />
        <input type="hidden" name="unit" value="hours" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Quality</label>
        <select
          name="valueText"
          className="w-full rounded-lg border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary"
        >
          <option value="">Select quality...</option>
          <option value="great">Great</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
          <option value="terrible">Terrible</option>
        </select>
      </div>
    </>
  );
}

function MoodFields() {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-text-secondary">Mood (1–10)</label>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
          <label key={val} className="cursor-pointer">
            <input
              type="radio"
              name="valueNumeric"
              value={val}
              className="peer sr-only"
              required
            />
            <div className="flex flex-col items-center gap-0.5 rounded-lg border border-surface-3 p-2 text-center transition-colors peer-checked:border-brand-primary peer-checked:bg-brand-primary/10">
              <span className="text-sm font-semibold text-text-primary">{val}</span>
              <span className="text-2xs text-text-muted">{MOOD_LABELS[val]}</span>
            </div>
          </label>
        ))}
      </div>
      <input type="hidden" name="unit" value="score" />
    </div>
  );
}

function EnergyFields() {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-text-secondary">Energy (1–10)</label>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
          <label key={val} className="cursor-pointer">
            <input
              type="radio"
              name="valueNumeric"
              value={val}
              className="peer sr-only"
              required
            />
            <div className="flex flex-col items-center gap-0.5 rounded-lg border border-surface-3 p-2 text-center transition-colors peer-checked:border-brand-primary peer-checked:bg-brand-primary/10">
              <span className="text-sm font-semibold text-text-primary">{val}</span>
              <span className="text-2xs text-text-muted">{ENERGY_LABELS[val]}</span>
            </div>
          </label>
        ))}
      </div>
      <input type="hidden" name="unit" value="score" />
    </div>
  );
}

function WorkoutFields() {
  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Workout type</label>
        <select
          name="valueText"
          required
          className="w-full rounded-lg border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary"
        >
          <option value="">Select type...</option>
          {WORKOUT_TYPES.map((wt) => (
            <option key={wt} value={wt.toLowerCase()}>
              {wt}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Duration (minutes)</label>
        <input
          type="number"
          name="valueNumeric"
          min="1"
          max="600"
          placeholder="30"
          required
          className="w-full rounded-lg border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary"
        />
        <input type="hidden" name="unit" value="minutes" />
      </div>
    </>
  );
}

function ExpenseFields() {
  return (
    <>
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Amount ($)</label>
        <input
          type="number"
          name="valueNumeric"
          step="0.01"
          min="0"
          placeholder="12.50"
          required
          className="w-full rounded-lg border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary"
        />
        <input type="hidden" name="unit" value="$" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-text-secondary">Category</label>
        <select
          name="valueText"
          className="w-full rounded-lg border border-surface-3 bg-surface-1 px-3 py-2 text-sm text-text-primary"
        >
          <option value="">Select category...</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat.toLowerCase()}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
