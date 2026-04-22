import Link from 'next/link';
import { getAllIdeas } from '@/server/services/ideas';
import { CreateIdeaButton } from '@/components/ideas/create-idea-button';
import { formatDate } from '@/lib/utils';
import { Lightbulb } from 'lucide-react';
import { buildPageMetadata, getCurrentLocale } from '@/lib/locale-server';
import { translateText } from '@/lib/i18n';

export async function generateMetadata() {
  return buildPageMetadata('Ideas');
}
export const dynamic = 'force-dynamic';

const STAGE_EMOJI: Record<string, string> = {
  seed: '🌱',
  developing: '🌿',
  mature: '🌳',
  implemented: '✅',
  archived: '📦',
};

const STAGE_COLORS: Record<string, string> = {
  seed: 'bg-yellow-50 text-yellow-700',
  developing: 'bg-green-50 text-green-700',
  mature: 'bg-emerald-50 text-emerald-700',
  implemented: 'bg-blue-50 text-blue-700',
  archived: 'bg-surface-2 text-text-muted',
};

export default async function IdeasPage() {
  const locale = await getCurrentLocale();
  const tx = (text: string) => translateText(text, locale);
  const allIdeas = getAllIdeas();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">{tx('Ideas')}</h1>
        <CreateIdeaButton />
      </div>

      {allIdeas.length === 0 ? (
        <div className="card py-12 text-center">
          <Lightbulb size={32} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-secondary">{tx('No ideas yet')}</p>
          <p className="text-2xs text-text-muted mt-1">
            {tx('Capture your first idea — seeds grow into projects.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {allIdeas.map((idea) => (
            <Link key={idea.id} href={`/ideas/${idea.id}`}>
              <div className="card hover:border-brand-200 cursor-pointer transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-text-primary truncate flex-1">{idea.title}</h3>
                  {idea.stage && (
                    <span className={`badge text-2xs shrink-0 ${STAGE_COLORS[idea.stage] ?? 'bg-surface-2 text-text-muted'}`}>
                      {STAGE_EMOJI[idea.stage] ?? ''} {tx(idea.stage)}
                    </span>
                  )}
                </div>
                {idea.summary && (
                  <p className="mt-1 text-2xs text-text-tertiary line-clamp-2">
                    {idea.summary}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  {idea.theme && (
                    <span className="badge bg-surface-2 text-text-tertiary text-2xs">
                      {idea.theme}
                    </span>
                  )}
                  <span className="text-2xs text-text-muted">
                    {formatDate(idea.updatedAt, locale)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
