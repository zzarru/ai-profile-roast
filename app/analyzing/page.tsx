'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  '그 사람 눈으로 보는 중...',
  '고백각 계산하는 중...',
  '호감도 변화량 측정 중...',
  '첫인상 분석 중...',
  '솔직한 속마음 꺼내는 중...',
];

export default function AnalyzingPage() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-6 animate-pulse">📐</div>
      <h2 className="text-xl font-bold mb-3">프사각 측정 중</h2>
      <p className="text-gray-400 text-sm min-h-[24px] transition-all">
        {MESSAGES[msgIdx]}
      </p>
    </main>
  );
}
