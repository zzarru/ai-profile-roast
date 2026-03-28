'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PRESET_PERSONAS } from '@/lib/presets';
import { saveSession } from '@/lib/store';
import PersonaCard from '@/components/PersonaCard';

export default function PersonaPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number | null>(null);

  function handleNext() {
    if (selected === null) return;
    const persona = PRESET_PERSONAS[selected];
    saveSession({
      personaName: persona.name,
      personaDescription: persona.description,
    });
    router.push('/upload');
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-lg mx-auto">
      <h1 className="text-2xl font-black mb-1">심판관 선택</h1>
      <p className="text-gray-400 text-sm mb-6">
        누가 당신의 프사를 평가할까요?
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {PRESET_PERSONAS.map((persona, i) => (
          <PersonaCard
            key={i}
            persona={persona}
            selected={selected === i}
            onClick={() => setSelected(i)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleNext}
          disabled={selected === null}
          className="w-full bg-white text-black font-bold py-4 rounded-full disabled:opacity-30 hover:bg-gray-200 transition-colors"
        >
          이 심판관으로 판결받기 →
        </button>
        <Link
          href="/persona/custom"
          className="w-full text-center border border-gray-700 text-gray-400 font-medium py-4 rounded-full hover:border-gray-500 transition-colors"
        >
          ✏️ 직접 심판관 만들기
        </Link>
      </div>
    </main>
  );
}
