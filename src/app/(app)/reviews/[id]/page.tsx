import { notFound } from 'next/navigation';
import { getReview } from '@/server/services/reviews';
import { ReviewDetailClient } from './client';

export const metadata = { title: 'Review — lifeOS' };
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const review = getReview(id);
  if (!review) notFound();

  return <ReviewDetailClient review={review} />;
}
