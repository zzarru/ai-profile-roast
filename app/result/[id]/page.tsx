import { getResult } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ResultPageClient from './ResultPageClient';

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getResult(id);
  if (!result) notFound();

  return <ResultPageClient result={result} />;
}
