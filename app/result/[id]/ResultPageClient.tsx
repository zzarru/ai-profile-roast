'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { RoastResult } from '@/lib/types';
import ResultCard from '@/components/ResultCard';
import ShareButtons from '@/components/ShareButtons';

export default function ResultPageClient({ result }: { result: RoastResult }) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <main className="min-h-screen px-4 py-10 max-w-lg mx-auto">
      <h1 className="text-2xl font-black mb-1">판결 완료 ⚖️</h1>
      <p className="text-gray-400 text-sm mb-6">
        {result.persona_name}의 솔직한 평가입니다
      </p>

      <ResultCard ref={cardRef} result={result} />

      <div className="mt-6 flex flex-col gap-3">
        <ShareButtons resultId={result.id} cardRef={cardRef} />
        <Link
          href="/"
          className="w-full text-center border border-gray-700 text-gray-400 py-4 rounded-full hover:border-gray-500 transition-colors text-sm"
        >
          다시 판결받기
        </Link>
      </div>
    </main>
  );
}
