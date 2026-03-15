import { getAllMetrics } from '@/server/services/metrics';
import { MetricsListClient } from './client';

export const metadata = { title: 'Metrics — lifeOS' };
export const dynamic = 'force-dynamic';

export default function MetricsPage() {
  const metrics = getAllMetrics();

  return <MetricsListClient metrics={metrics} />;
}
