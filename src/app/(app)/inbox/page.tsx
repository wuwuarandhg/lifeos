import { getPendingInboxItems } from '@/server/services/inbox';
import { InboxItemList } from '@/components/inbox/inbox-item-list';
import { QuickCapture } from '@/components/capture/quick-capture';
import { Inbox as InboxIcon } from 'lucide-react';

export const metadata = { title: 'Inbox — lifeOS' };
export const dynamic = 'force-dynamic';

export default function InboxPage() {
  const items = getPendingInboxItems();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Inbox</h1>
        <span className="text-sm text-text-tertiary">
          {items.length} pending
        </span>
      </div>

      <QuickCapture />

      {items.length === 0 ? (
        <div className="card py-12 text-center">
          <InboxIcon size={32} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-muted">Inbox zero! 🎉</p>
          <p className="text-2xs text-text-muted mt-1">Capture something with the bar above.</p>
        </div>
      ) : (
        <InboxItemList items={items} />
      )}
    </div>
  );
}
