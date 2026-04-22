import { getPendingInboxItems } from '@/server/services/inbox';
import { InboxItemList } from '@/components/inbox/inbox-item-list';
import { QuickCapture } from '@/components/capture/quick-capture';
import { Inbox as InboxIcon } from 'lucide-react';
import { buildPageMetadata, getCurrentLocale } from '@/lib/locale-server';
import { formatPendingCount, translateText } from '@/lib/i18n';

export async function generateMetadata() {
  return buildPageMetadata('Inbox');
}
export const dynamic = 'force-dynamic';

export default async function InboxPage() {
  const locale = await getCurrentLocale();
  const tx = (text: string) => translateText(text, locale);
  const items = getPendingInboxItems();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">{tx('Inbox')}</h1>
        <span className="text-sm text-text-tertiary">
          {formatPendingCount(locale, items.length)}
        </span>
      </div>

      <QuickCapture />

      {items.length === 0 ? (
        <div className="card py-12 text-center">
          <InboxIcon size={32} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-muted">{tx('Inbox zero! 🎉')}</p>
          <p className="text-2xs text-text-muted mt-1">{tx('Capture something with the bar above.')}</p>
        </div>
      ) : (
        <InboxItemList items={items} />
      )}
    </div>
  );
}
