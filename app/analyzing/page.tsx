'use client';

import { useEffect, useState } from 'react';

const MESSAGES = [
  '심판관이 눈썹을 찌푸리고 있습니다...',
  '냉정하게 분석 중...',
  '솔직히 말하기 위해 마음의 준비 중...',
  '판결문 작성 중...',
  '이건 좀 심한데 싶은 부분 찾는 중...',
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
      <div className="text-6xl mb-6 animate-pulse">⚖️</div>
      <h2 className="text-xl font-bold mb-3">판결 중</h2>
      <p className="text-gray-400 text-sm min-h-[24px] transition-all">
        {MESSAGES[msgIdx]}
      </p>
    </main>
  );
}
