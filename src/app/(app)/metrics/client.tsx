'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, BarChart3 } from 'lucide-react';
import { METRIC_TYPE_LABELS, METRIC_TYPE_ICONS, MOOD_LABELS, ENERGY_LABELS } from '@/lib/constants';
import { formatISODate, relativeDayLabel } from '@/lib/utils';
import type { MetricType } from '@/lib/types';

interface Metric {
  id: string;
  metricType: string;
  valueNumeric: number | null;
  valueText: string | null;
  unit: string | null;
  loggedDate: string;
  note: string | null;
  createdAt: number;
}

const FILTER_TYPES: { value: MetricType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '📊' },
  { value: 'sleep', label: 'Sleep', icon: '🛌' },
  { value: 'mood', label: 'Mood', icon: '😊' },
  { value: 'energy', label: 'Energy', icon: '⚡' },
  { value: 'workout', label: 'Workout', icon: '🏋️' },
  { value: 'expense', label: 'Expense', icon: '💸' },
];

function formatMetricValue(metric: Metric): string {
  const { metricType, valueNumeric, valueText, unit } = metric;

  if (metricType === 'mood' && valueNumeric) {
    return `${valueNumeric}/10 — ${MOOD_LABELS[valueNumeric] || ''}`;
  }
  if (metricType === 'energy' && valueNumeric) {
    return `${valueNumeric}/10 — ${ENERGY_LABELS[valueNumeric] || ''}`;
  }
  if (metricType === 'sleep' && valueNumeric) {
    return `${valueNumeric} ${unit || 'hours'}`;
  }
  if (metricType === 'workout') {
    const parts: string[] = [];
    if (valueText) parts.push(valueText);
    if (valueNumeric) parts.push(`${valueNumeric} ${unit || 'min'}`);
    return parts.join(' · ') || 'Workout';
  }
  if (metricType === 'expense') {
    const parts: string[] = [];
    if (valueNumeric) parts.push(`$${valueNumeric.toFixed(2)}`);
    if (valueText) parts.push(valueText);
    return parts.join(' · ') || 'Expense';
  }
  if (valueNumeric !== null) {
    return `${valueNumeric}${unit ? ` ${unit}` : ''}`;
  }
  return valueText || '—';
}

export function MetricsListClient({ metrics, hideHeader = false }: { metrics: Metric[]; hideHeader?: boolean }) {
  const [filter, setFilter] = useState<MetricType | 'all'>('all');

  const filtered = filter === 'all'
    ? metrics
    : metrics.filter(m => m.metricType === filter);

  // Group by date
  const grouped = new Map<string, Metric[]>();
  for (const m of filtered) {
    const existing = grouped.get(m.loggedDate);
    if (existing) {
      existing.push(m);
    } else {
      grouped.set(m.loggedDate, [m]);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-text-primary">Metrics</h1>
          <Link
            href="/metrics/log"
            className="btn-primary flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            <Plus size={16} />
            Log
          </Link>
        </div>
      )}

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TYPES.map((ft) => (
          <button
            key={ft.value}
            onClick={() => setFilter(ft.value)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === ft.value
                ? 'bg-brand-primary text-white'
                : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
            }`}
          >
            <span>{ft.icon}</span>
            <span>{ft.label}</span>
          </button>
        ))}
      </div>

      {/* Metric list grouped by date */}
      {grouped.size === 0 ? (
        <div className="card py-12 text-center">
          <BarChart3 size={32} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-muted">No metrics logged yet.</p>
          <Link
            href="/metrics/log"
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-primary hover:underline"
          >
            <Plus size={14} />
            Log your first metric
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([date, items]) => (
            <div key={date}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {relativeDayLabel(date)} {date !== relativeDayLabel(date) ? '' : `· ${formatISODate(date)}`}
              </h3>
              <div className="space-y-1.5">
                {items.map((m) => (
                  <Link
                    key={m.id}
                    href={`/metrics/${m.id}`}
                    className="card flex items-center gap-3 p-3 transition-colors hover:bg-surface-2"
                  >
                    <span className="text-lg" title={METRIC_TYPE_LABELS[m.metricType]}>
                      {METRIC_TYPE_ICONS[m.metricType] || '📊'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {METRIC_TYPE_LABELS[m.metricType] || m.metricType}
                      </p>
                      <p className="truncate text-xs text-text-tertiary">
                        {formatMetricValue(m)}
                      </p>
                    </div>
                    {m.note && (
                      <span className="text-2xs text-text-muted truncate max-w-[120px]">
                        {m.note}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
