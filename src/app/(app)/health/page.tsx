import { getMetricsByTypes } from '@/server/services/metrics';
import { MetricsListClient } from '@/app/(app)/metrics/client';
import type { MetricType } from '@/lib/types';

export const metadata = { title: 'Health — lifeOS' };
export const dynamic = 'force-dynamic';

const HEALTH_TYPES: MetricType[] = ['sleep', 'mood', 'energy', 'workout', 'symptom', 'body_metric'];

export default function HealthPage() {
  const metrics = getMetricsByTypes(HEALTH_TYPES);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold text-text-primary">Health</h1>
      <p className="text-sm text-text-tertiary">Sleep, mood, energy, workouts, and body metrics.</p>
      <MetricsListClient metrics={metrics} hideHeader />
    </div>
  );
}
