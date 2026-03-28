'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveSession } from '@/lib/store';

type Step = 'input' | 'loading' | 'confirm';
type InputMode = 'describe' | 'kakao';

const EXAMPLES: Record<InputMode, { label: string; text: string }[]> = {
  describe: [
    {
      label: '전 남자친구',
      text: '나를 3년 전에 차버린 전 남자친구. 완벽주의자고 외모에 기준이 엄청 높음. 항상 내 스타일 지적하고, 사진 찍을 때 각도 뭐가 어떻다고 잔소리했음. 지금은 나보다 못한 사람이랑 사귀는 중.',
    },
    {
      label: '직장 상사',
      text: '우리 팀 차장님. 완벽주의에 표정 관리 철저한 냉정한 타입. 칭찬 한번 안 하고 항상 "이게 최선이에요?"라고 되묻는 스타일. 패션 센스는 있는데 남들한테도 높은 기준 들이댐.',
    },
    {
      label: '인기 선배',
      text: '동아리 인기 선배. 잘생기고 스펙도 좋은데 본인도 그걸 앎. 후배들 사진 보면 무심하게 "뭐 이런 걸 올려"라고 하는 타입. 근데 마음에 들면 티나게 챙겨줌.',
    },
  ],
  kakao: [
    {
      label: '예시 형식 보기',
      text: `김민준: 야 이 사진 어때?
나: 괜찮은 거 같은데
김민준: 아 이 각도 별로임. 좀 더 위에서 찍어
나: 그냥 올리면 안 됨?
김민준: 솔직히 저 배경은 진짜 최악이고 표정도 너무 힘줬잖아
나: ...
김민준: 그냥 내 말대로 다시 찍어. 니 얼굴이면 더 잘 나올 수 있어`,
    },
  ],
};

const TIPS: Record<InputMode, string[]> = {
  describe: [
    '외모 기준이 높은지 낮은지',
    '어떤 스타일을 선호하는지',
    '솔직한 편인지, 돌려 말하는지',
    '나와의 관계 (친구, 전연인, 상사 등)',
  ],
  kakao: [
    '길수록 페르소나 정확도 올라감',
    '말투와 어조가 잘 드러나는 대화 선택',
    '외모/사진 관련 대화면 더 정확',
    '이름/닉네임은 그대로 넣어도 됨',
  ],
};

export default function CustomPersonaPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('input');
  const [mode, setMode] = useState<InputMode>('describe');
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
    } catch {
      setError('페르소나 추출에 실패했어요. 다시 시도해주세요.');
      setStep('input');
    }
  }

  function handleConfirm() {
    if (!extracted) return;
    saveSession({
      personaName: extracted.persona_name,
      personaDescription: extracted.persona_description,
      personaViewpoint: '', // 프리셋 viewpoint 잔여 방지
    });
    router.push('/upload');
  }

  function handleModeChange(newMode: InputMode) {
    setMode(newMode);
    setText('');
    setError('');
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

  const placeholders: Record<InputMode, string> = {
    describe:
      '예시: "나를 차버린 전 남자친구. 완벽주의자고 외모 기준이 높음. 항상 내 스타일 지적했음."',
    kakao: '카카오톡 대화 내용을 그대로 붙여넣어 주세요.\n이름/닉네임 포함해도 괜찮아요.',
  };

  const charCount = text.trim().length;
  const isReady = charCount >= 10;

  return (
    <main className="min-h-screen px-4 py-10 max-w-lg mx-auto">
      <h1 className="text-2xl font-black mb-1">심판관 직접 만들기</h1>
      <p className="text-gray-400 text-sm mb-6">
        평가받고 싶은 사람을 알려주면 AI가 그 사람처럼 판결해줘요
      </p>

      {/* 입력 방식 탭 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleModeChange('describe')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === 'describe'
              ? 'bg-white text-black'
              : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-gray-500'
          }`}
        >
          ✍️ 직접 설명
        </button>
        <button
          onClick={() => handleModeChange('kakao')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === 'kakao'
              ? 'bg-white text-black'
              : 'bg-gray-900 text-gray-400 border border-gray-700 hover:border-gray-500'
          }`}
        >
          💬 카카오톡 붙여넣기
        </button>
      </div>

      {/* 예시 빠른 선택 */}
      <div className="flex gap-2 flex-wrap mb-3">
        {EXAMPLES[mode].map((ex) => (
          <button
            key={ex.label}
            onClick={() => setText(ex.text)}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-gray-400 hover:text-white transition-all"
          >
            {ex.label} 예시 →
          </button>
        ))}
      </div>

      {/* 입력창 */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholders[mode]}
        className="w-full h-44 bg-gray-900 border border-gray-700 rounded-2xl p-4 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-gray-500 transition-colors"
      />

      {/* 글자 수 + 에러 */}
      <div className="flex justify-between items-center mt-1.5 mb-3">
        {error ? (
          <p className="text-red-400 text-xs">{error}</p>
        ) : (
          <p className={`text-xs ${isReady ? 'text-gray-500' : 'text-gray-600'}`}>
            {!isReady && charCount > 0 ? `${10 - charCount}자 더 입력하면 분석 가능해요` : ''}
          </p>
        )}
        <p className="text-xs text-gray-600 ml-auto">{charCount}자</p>
      </div>

      {/* 입력 팁 */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-4">
        <p className="text-xs text-gray-500 font-semibold mb-2">
          💡 이런 내용이 있으면 결과가 더 정확해요
        </p>
        <ul className="space-y-1">
          {TIPS[mode].map((tip) => (
            <li key={tip} className="text-xs text-gray-600 flex gap-1.5">
              <span>•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleExtract}
        disabled={!isReady}
        className="w-full bg-white text-black font-bold py-4 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        AI로 심판관 분석하기
      </button>
    </main>
  );
}
