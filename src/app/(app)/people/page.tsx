import Link from 'next/link';
import { getAllPeople } from '@/server/services/entities';
import { CreatePersonButton } from '@/components/people/create-person-button';
import { formatDate } from '@/lib/utils';
import { Users } from 'lucide-react';

export const metadata = { title: 'People — lifeOS' };
export const dynamic = 'force-dynamic';

export default function PeoplePage() {
  const people = getAllPeople();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">People</h1>
        <CreatePersonButton />
      </div>

      {people.length === 0 ? (
        <div className="card py-12 text-center">
          <Users size={32} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-secondary">No people added yet</p>
          <p className="text-2xs text-text-muted mt-1">
            Add people you interact with to track context and connections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => {
            const meta = person.parsedMetadata as Record<string, string>;
            return (
              <Link key={person.id} href={`/people/${person.id}`}>
                <div className="card hover:border-brand-200 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-50 text-sm font-semibold text-pink-600">
                      {person.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-text-primary truncate">{person.title}</h3>
                      <div className="flex items-center gap-2">
                        {meta?.relationship && (
                          <span className="text-2xs text-text-tertiary">{meta.relationship}</span>
                        )}
                        {meta?.company && (
                          <span className="text-2xs text-text-muted">· {meta.company}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {person.body && (
                    <p className="mt-2 text-2xs text-text-tertiary line-clamp-2">
                      {person.body.slice(0, 120)}
                    </p>
                  )}
                  <p className="mt-2 text-2xs text-text-muted">
                    {formatDate(person.updatedAt)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
