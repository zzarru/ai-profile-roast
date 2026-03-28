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
      text: `나와의 관계: 3년 전에 나를 차버린 전 남자친구
성격: 완벽주의자. 감정 표현 거의 없음. 항상 냉정하게 팩트만 말함
외모 호불호: 기준이 엄청 높음. 자연스러운 스타일 선호, 과한 화장이나 필터 싫어함
취미/관심사: 운동, 사진 구도에 진심
평소 말투: 직설적 반말. "그 각도 별로야", "배경이 왜 이래", "다시 찍어" 스타일`,
    },
    {
      label: '직장 상사',
      text: `나와의 관계: 같은 팀 차장님. 나보다 7살 많음
성격: 완벽주의, 표정 관리 철저, 칭찬 거의 안 함
외모 호불호: 단정하고 깔끔한 스타일 선호. 과한 연출 싫어함
취미/관심사: 골프, 자기계발서
평소 말투: "이게 최선이에요?", "다시 한번 생각해봐요" 같은 돌려 까는 스타일. 존댓말이지만 차가움`,
    },
    {
      label: '인기 선배',
      text: `나와의 관계: 동아리 선배. 나 좋아하는 것 같기도 한데 모르겠음
성격: 잘생기고 스펙도 좋은데 본인이 그걸 앎. 무심한 척하지만 은근 챙겨줌
외모 호불호: 분위기 있는 사진 좋아함. 과한 보정이나 억지 표정 싫어함
취미/관심사: 밴드, 영화, 여행
평소 말투: 짧고 무심한 반말. "뭐 이런 걸 올려", "그냥 올려 어차피 잘 나왔잖아" 스타일`,
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
    '나와의 관계 (전 연인, 상사, 짝사랑 상대 등)',
    '성격 (완벽주의? 감성적? 직설적?)',
    '외모·사진 호불호 (어떤 스타일 좋아하고 싫어하는지)',
    '취미나 관심사',
    '평소 말투나 자주 하는 말',
  ],
  kakao: [
    '길수록 페르소나 정확도 올라감',
    '말투·어조가 잘 드러나는 대화 선택',
    '사진·외모 관련 대화면 더 정확',
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
    persona_viewpoint: string;
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
      personaViewpoint: extracted.persona_viewpoint,
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
    describe: `나와의 관계: (예: 3년 전에 차버린 전 남자친구)
성격: (예: 완벽주의, 감정 표현 없음, 직설적)
외모·사진 호불호: (예: 자연스러운 스타일 선호, 과한 필터 싫어함)
취미/관심사: (예: 운동, 사진)
평소 말투: (예: "그 각도 별로야", "다시 찍어" 스타일)`,
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
