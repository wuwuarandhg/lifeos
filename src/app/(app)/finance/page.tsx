import { getMetricsByTypes } from '@/server/services/metrics';
import { MetricsListClient } from '@/app/(app)/metrics/client';
import type { MetricType } from '@/lib/types';

export const metadata = { title: 'Finance — lifeOS' };
export const dynamic = 'force-dynamic';

const FINANCE_TYPES: MetricType[] = ['expense'];

export default function FinancePage() {
  const metrics = getMetricsByTypes(FINANCE_TYPES);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-semibold text-text-primary">Finance</h1>
      <p className="text-sm text-text-tertiary">Track expenses and spending patterns.</p>
      <MetricsListClient metrics={metrics} hideHeader />
    </div>
  );
}
