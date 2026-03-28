'use client';

import { Persona } from '@/lib/types';

interface Props {
  persona: Persona;
  selected: boolean;
  onClick: () => void;
}

export default function PersonaCard({ persona, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
        selected
          ? 'border-white bg-white/10'
          : 'border-gray-800 hover:border-gray-600'
      }`}
    >
      <div className="text-3xl mb-2">{persona.emoji}</div>
      <div className="font-bold text-base">{persona.name}</div>
      <div className="text-xs text-gray-400 mt-1 line-clamp-2">
        {persona.description}
      </div>
    </button>
  );
}
