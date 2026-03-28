'use client';

import { useRouter } from 'next/navigation';
import { PRESET_PERSONAS } from '@/lib/presets';
import { saveSession } from '@/lib/store';

export default function PersonaPage() {
  const router = useRouter();

  function handleSelect(i: number) {
    const persona = PRESET_PERSONAS[i];
    saveSession({
      personaName: persona.name,
      personaDescription: persona.description,
      personaViewpoint: persona.viewpoint,
    });
    router.push('/upload');
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-lg mx-auto">
      <h1 className="text-2xl font-black mb-1">누구한테 보여줄까?</h1>
      <p className="text-gray-400 text-sm mb-6">
        이 사람의 시각으로 프사각을 측정합니다
      </p>

      <div className="grid grid-cols-2 gap-3">
        {PRESET_PERSONAS.map((persona, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className="w-full text-left p-5 rounded-2xl border-2 border-gray-800 hover:border-white hover:bg-white/5 transition-all active:scale-95"
          >
            <div className="text-4xl mb-3">{persona.emoji}</div>
            <div className="font-bold text-base leading-tight">{persona.name}</div>
          </button>
        ))}

        {/* 직접 만들기 카드 */}
        <button
          onClick={() => router.push('/persona/custom')}
          className="w-full text-left p-5 rounded-2xl border-2 border-dashed border-gray-700 hover:border-gray-400 hover:bg-white/5 transition-all active:scale-95"
        >
          <div className="text-4xl mb-3">✏️</div>
          <div className="font-bold text-base leading-tight text-gray-400">직접 입력하기</div>
        </button>
      </div>
    </main>
  );
}
