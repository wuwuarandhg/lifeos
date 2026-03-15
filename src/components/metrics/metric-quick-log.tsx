'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Moon, Smile, Zap, Check, BarChart3 } from 'lucide-react';
import { quickLogMetricsAction } from '@/app/actions';
import { MOOD_LABELS, ENERGY_LABELS } from '@/lib/constants';

interface TodayMetric {
  metricType: string;
  valueNumeric: number | null;
}

interface MetricQuickLogProps {
  todayMetrics: TodayMetric[];
}

export function MetricQuickLog({ todayMetrics }: MetricQuickLogProps) {
  const [sleep, setSleep] = useState('');
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const existingSleep = todayMetrics.find(m => m.metricType === 'sleep');
  const existingMood = todayMetrics.find(m => m.metricType === 'mood');
  const existingEnergy = todayMetrics.find(m => m.metricType === 'energy');

  const allLogged = !!(existingSleep && existingMood && existingEnergy);

  const handleSubmit = async () => {
    setSubmitting(true);
    await quickLogMetricsAction({
      sleep: sleep ? parseFloat(sleep) : undefined,
      mood: mood || undefined,
      energy: energy || undefined,
    });
    setSaved(true);
    setSubmitting(false);
    // Reset after a moment
    setTimeout(() => setSaved(false), 2000);
  };

  if (allLogged && !saved) {
    return (
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-text-muted" />
            <h2 className="text-sm font-semibold text-text-primary">Life Signals</h2>
          </div>
          <Link href="/metrics" className="text-2xs text-brand-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-surface-2 p-2">
            <Moon size={14} className="text-indigo-400" />
            <div>
              <p className="text-xs font-medium text-text-primary">{existingSleep?.valueNumeric}h</p>
              <p className="text-2xs text-text-muted">Sleep</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface-2 p-2">
            <Smile size={14} className="text-amber-400" />
            <div>
              <p className="text-xs font-medium text-text-primary">{existingMood?.valueNumeric}/10</p>
              <p className="text-2xs text-text-muted">Mood</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface-2 p-2">
            <Zap size={14} className="text-yellow-400" />
            <div>
              <p className="text-xs font-medium text-text-primary">{existingEnergy?.valueNumeric}/10</p>
              <p className="text-2xs text-text-muted">Energy</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-text-muted" />
          <h2 className="text-sm font-semibold text-text-primary">Life Signals</h2>
        </div>
        <Link href="/metrics/log" className="text-2xs text-brand-primary hover:underline">
          Full log →
        </Link>
      </div>

      {saved ? (
        <div className="flex items-center justify-center gap-2 py-4 text-green-500">
          <Check size={18} />
          <span className="text-sm font-medium">Saved!</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Sleep */}
          {!existingSleep && (
            <div className="flex items-center gap-3">
              <Moon size={16} className="text-indigo-400 flex-shrink-0" />
              <label className="text-xs text-text-secondary w-12 flex-shrink-0">Sleep</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                placeholder="hrs"
                className="w-20 rounded-lg border border-surface-3 bg-surface-1 px-2 py-1.5 text-sm text-text-primary text-center"
              />
              <span className="text-2xs text-text-muted">hours</span>
            </div>
          )}

          {/* Mood */}
          {!existingMood && (
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <Smile size={16} className="text-amber-400 flex-shrink-0" />
                <label className="text-xs text-text-secondary w-12 flex-shrink-0">Mood</label>
                <span className="text-xs text-text-muted">
                  {mood > 0 ? `${mood} — ${MOOD_LABELS[mood] || ''}` : 'Select...'}
                </span>
              </div>
              <div className="flex gap-1 ml-[76px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                  <button
                    key={val}
                    onClick={() => setMood(mood === val ? 0 : val)}
                    className={`h-7 w-7 rounded text-xs font-medium transition-colors ${
                      mood === val
                        ? 'bg-brand-primary text-white'
                        : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Energy */}
          {!existingEnergy && (
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <Zap size={16} className="text-yellow-400 flex-shrink-0" />
                <label className="text-xs text-text-secondary w-12 flex-shrink-0">Energy</label>
                <span className="text-xs text-text-muted">
                  {energy > 0 ? `${energy} — ${ENERGY_LABELS[energy] || ''}` : 'Select...'}
                </span>
              </div>
              <div className="flex gap-1 ml-[76px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                  <button
                    key={val}
                    onClick={() => setEnergy(energy === val ? 0 : val)}
                    className={`h-7 w-7 rounded text-xs font-medium transition-colors ${
                      energy === val
                        ? 'bg-brand-primary text-white'
                        : 'bg-surface-2 text-text-secondary hover:bg-surface-3'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || (!sleep && mood === 0 && energy === 0)}
            className="w-full rounded-lg bg-brand-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Log Signals'}
          </button>
        </div>
      )}
    </div>
  );
}
