import { getTimelineFeed, getTimelineStats } from '@/server/services/timeline';
import { TimelineClient } from './client';

export const metadata = { title: 'Timeline — lifeOS' };
export const dynamic = 'force-dynamic';

export default function TimelinePage() {
  const feed = getTimelineFeed();
  const stats = getTimelineStats();

  return (
    <div className="space-y-6 animate-fade-in">
      <TimelineClient
        initialDayGroups={feed.dayGroups}
        initialHasMore={feed.hasMore}
        stats={stats}
      />
    </div>
  );
}
