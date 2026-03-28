'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveSession } from '@/lib/store';

type Step = 'input' | 'loading' | 'confirm';

export default function CustomPersonaPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('input');
  const [text, setText] = useState('');
  const [extracted, setExtracted] = useState<{
    persona_name: string;
    persona_description: string;
  } | null>(null);
  const [error, setError] = useState('');

  async function handleExtract() {
    if (text.trim().length < 10) {
      setError('좀 더 자세히 써주세요!');
      return;
    }
    setError('');
    setStep('loading');

    try {
      const res = await fetch('/api/extract-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setExtracted(data);
      setStep('confirm');
    } catch (e) {
      setError('페르소나 추출에 실패했어요. 다시 시도해주세요.');
      setStep('input');
    }
  }

  function handleConfirm() {
    if (!extracted) return;
    saveSession({
      personaName: extracted.persona_name,
      personaDescription: extracted.persona_description,
    });
    router.push('/upload');
  }

  if (step === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-400">심판관 분석 중...</p>
        </div>
      </main>
    );
  }

  if (step === 'confirm' && extracted) {
    return (
      <main className="min-h-screen px-4 py-10 max-w-lg mx-auto">
        <h1 className="text-2xl font-black mb-1">이 심판관 맞나요?</h1>
        <p className="text-gray-400 text-sm mb-6">AI가 분석한 결과예요</p>

        <div className="border border-gray-700 rounded-2xl p-6 mb-6">
          <div className="text-2xl mb-2">🎭</div>
          <div className="font-bold text-xl mb-2">{extracted.persona_name}</div>
          <div className="text-gray-400 text-sm leading-relaxed">
            {extracted.persona_description}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            className="w-full bg-white text-black font-bold py-4 rounded-full hover:bg-gray-200 transition-colors"
          >
            맞아, 이 심판관으로 판결받기 →
          </button>
          <button
            onClick={() => setStep('input')}
            className="w-full border border-gray-700 text-gray-400 py-4 rounded-full hover:border-gray-500 transition-colors"
          >
            다시 입력하기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-lg mx-auto">
      <h1 className="text-2xl font-black mb-1">심판관 직접 만들기</h1>
      <p className="text-gray-400 text-sm mb-6">
        어떤 사람이 평가하길 원하나요?
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`예시:\n"나를 3년 전에 차버린 전 남자친구. 완벽주의자고 외모에 기준이 높음. 항상 내 스타일을 지적했음."\n\n또는 카카오톡 대화 내용을 그대로 붙여넣어도 됩니다.`}
        className="w-full h-48 bg-gray-900 border border-gray-700 rounded-2xl p-4 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-gray-500"
      />

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      <button
        onClick={handleExtract}
        className="w-full mt-4 bg-white text-black font-bold py-4 rounded-full hover:bg-gray-200 transition-colors"
      >
        AI로 심판관 분석하기
      </button>
    </main>
  );
}
