import { MetricLogClient } from './client';

export const metadata = { title: 'Log Metric — lifeOS' };
export const dynamic = 'force-dynamic';

export default function MetricLogPage() {
  return <MetricLogClient />;
}
