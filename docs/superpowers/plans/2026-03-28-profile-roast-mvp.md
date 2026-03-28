# AI Profile Roast MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 프로필 사진을 업로드하면 선택한 페르소나가 AI로 솔직하게 평가해주는 서비스를 2시간 내에 MVP로 완성한다.

**Architecture:** Next.js 14 App Router 기반 풀스택 앱. 클라이언트에서 수집한 사진(base64)과 페르소나를 API Route로 전송하면 Claude Vision API가 분석하고 결과를 Supabase에 저장한다. `/result/[id]` URL이 공유 링크가 된다.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS, Claude API (claude-sonnet-4-6), Supabase JS Client, html-to-image

---

## File Map

```
app/
  layout.tsx                     # 루트 레이아웃, 글로벌 폰트/메타
  globals.css                    # 기본 스타일
  page.tsx                       # 메인 페이지
  persona/
    page.tsx                     # 페르소나 선택 (프리셋 카드)
    custom/
      page.tsx                   # 커스텀 페르소나 입력
  upload/
    page.tsx                     # 사진 업로드
  analyzing/
    page.tsx                     # 로딩 페이지 (폴링)
  result/
    [id]/
      page.tsx                   # 결과 페이지
  api/
    extract-persona/
      route.ts                   # POST: 텍스트 → 페르소나 추출
    analyze/
      route.ts                   # POST: 사진+페르소나 → 판결+저장
    result/
      [id]/
        route.ts                 # GET: Supabase에서 결과 조회

lib/
  claude.ts                      # Claude API 호출 헬퍼
  supabase.ts                    # Supabase 클라이언트 (server/client)
  presets.ts                     # 프리셋 페르소나 데이터
  types.ts                       # 공유 타입 정의

components/
  PersonaCard.tsx                # 프리셋 선택 카드
  ResultCard.tsx                 # 결과 카드 (공유용 ref 포함)
  ShareButtons.tsx               # 링크 복사 + 이미지 저장
```

---

## Task 1: Next.js 프로젝트 초기 세팅

**Files:**
- Create: `package.json`, `app/layout.tsx`, `app/globals.css`, `.env.local`, `lib/types.ts`, `lib/presets.ts`

- [ ] **Step 1: Next.js 프로젝트 생성**

```bash
cd /Users/zaru/Desktop/ttalkkakthon
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*" --yes
```

Expected: 프로젝트 파일 생성 완료

- [ ] **Step 2: 의존성 설치**

```bash
npm install @anthropic-ai/sdk @supabase/supabase-js html-to-image
```

- [ ] **Step 3: 환경변수 파일 생성**

`.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 4: 공유 타입 정의**

`lib/types.ts`:
```typescript
export interface Persona {
  name: string;
  description: string;
  emoji: string;
}

export interface RoastResult {
  id: string;
  persona_name: string;
  persona_description: string;
  score: number;
  score_label: string;
  first_impression: string;
  inner_thoughts: string[];
  kind_comment: string;
  created_at: string;
}
```

- [ ] **Step 5: 프리셋 페르소나 데이터 정의**

`lib/presets.ts`:
```typescript
import { Persona } from './types';

export const PRESET_PERSONAS: Persona[] = [
  {
    name: '현실주의 직장인',
    emoji: '👔',
    description: '현실적이고 솔직한 30대 직장인. 쓸데없는 감성 없이 팩트만 말한다. 연애도 스펙으로 본다.',
  },
  {
    name: '감성적인 예술가',
    emoji: '🎨',
    description: '미적 감각이 예민한 예술가. 사진의 구도, 색감, 분위기를 날카롭게 분석한다. 평범함을 견디지 못한다.',
  },
  {
    name: '활동적인 운동파',
    emoji: '💪',
    description: '헬스 유튜버 감성의 운동 마니아. 체형과 자세에 집착한다. 운동 안 하는 사람을 이해 못 한다.',
  },
  {
    name: '까다로운 패션 에디터',
    emoji: '👗',
    description: '패션 매거진 에디터. 옷, 액세서리, 스타일링 모든 걸 심판한다. 기본이 안 된 스타일을 혐오한다.',
  },
  {
    name: '차가운 전 연인',
    emoji: '🥶',
    description: '나를 차버린 전 연인. 지금의 나를 보며 "역시 잘 찼다"고 생각할 사람. 냉정하고 비교를 잘 한다.',
  },
  {
    name: '엄격한 할머니',
    emoji: '👵',
    description: '손주 걱정이 많은 할머니. 잔소리 장인. 외모보다 인상과 눈빛을 본다. 애정 어린 독설을 구사한다.',
  },
];
```

- [ ] **Step 6: 개발 서버 실행 확인**

```bash
npm run dev
```

Expected: `http://localhost:3000` 에서 Next.js 기본 페이지 확인

- [ ] **Step 7: 초기 커밋**

```bash
git add -A
git commit -m "feat: initial Next.js project setup with types and presets"
git push -u origin main
```

---

## Task 2: Supabase 세팅

**Files:**
- Create: `lib/supabase.ts`
- Supabase 대시보드에서 테이블 생성

- [ ] **Step 1: Supabase 테이블 생성**

Supabase 대시보드 → SQL Editor에서 실행:

```sql
create table results (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  persona_name text not null,
  persona_description text not null,
  score integer not null,
  score_label text not null,
  first_impression text not null,
  inner_thoughts jsonb not null,
  kind_comment text not null
);

-- 공개 읽기 허용 (공유 링크 접근용)
alter table results enable row level security;
create policy "Public read" on results for select using (true);
create policy "Public insert" on results for insert with check (true);
```

- [ ] **Step 2: Supabase 클라이언트 생성**

`lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import { RoastResult } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveResult(
  result: Omit<RoastResult, 'id' | 'created_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('results')
    .insert(result)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getResult(id: string): Promise<RoastResult | null> {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as RoastResult;
}
```

- [ ] **Step 3: 환경변수에 Supabase 값 입력**

`.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 실제 값으로 교체.
Supabase 대시보드 → Settings → API에서 확인.

- [ ] **Step 4: 커밋**

```bash
git add lib/supabase.ts .env.local
git commit -m "feat: add Supabase client and results table"
```

---

## Task 3: Claude API 헬퍼 + API Routes 구현

**Files:**
- Create: `lib/claude.ts`, `app/api/extract-persona/route.ts`, `app/api/analyze/route.ts`

- [ ] **Step 1: Claude API 헬퍼 생성**

`lib/claude.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function extractPersona(text: string): Promise<{
  persona_name: string;
  persona_description: string;
}> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `다음 텍스트(카카오톡 대화 or 설명)를 분석해서 이 사람의 페르소나를 추출해줘.

텍스트:
${text}

JSON으로만 답해줘 (다른 텍스트 없이):
{
  "persona_name": "페르소나 이름 (예: 차가운 전 연인, 완벽주의 직장 상사)",
  "persona_description": "이 사람의 성격, 가치관, 외모에 대한 기준을 2-3문장으로. 나중에 이 설명을 보고 그 사람처럼 행동할 수 있을 만큼 구체적으로."
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  return JSON.parse(content.text);
}

export async function analyzePhoto(
  imageBase64: string,
  imageMediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
  personaName: string,
  personaDescription: string
): Promise<{
  score: number;
  score_label: string;
  first_impression: string;
  inner_thoughts: string[];
  kind_comment: string;
}> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: imageMediaType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: `너는 지금 "${personaName}"이야. ${personaDescription}

이 사람의 프로필 사진(소개팅 or SNS용)을 봤어. 솔직하고 날카롭게 평가해줘. 위로하거나 순화하지 마.

JSON으로만 답해줘 (다른 텍스트 없이):
{
  "score": <정수. 끔찍하면 -99999도 가능, 최고는 100. 극단적인 숫자 써도 됨>,
  "score_label": <점수 한 줄 레이블. 예: "폭망", "처참", "글쎄...", "나쁘지 않음", "합격", "대박">,
  "first_impression": <이 페르소나의 솔직한 첫인상 한 줄. 반말로. 킹받지만 웃긴 톤>,
  "inner_thoughts": [<이 페르소나가 속으로 생각할 것 같은 솔직한 한 줄씩, 3~5개. 반말. 독설이지만 웃겨야 함>],
  "kind_comment": <실제로 상대방한테 착하게 해줄 말 1줄. 속마음과 대비되는 위로의 말. 반말>
}`,
          },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  return JSON.parse(content.text);
}
```

- [ ] **Step 2: extract-persona API Route 구현**

`app/api/extract-persona/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { extractPersona } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: '텍스트가 너무 짧아요' }, { status: 400 });
    }

    const result = await extractPersona(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error('extract-persona error:', error);
    return NextResponse.json({ error: '페르소나 추출 실패' }, { status: 500 });
  }
}
```

- [ ] **Step 3: analyze API Route 구현**

`app/api/analyze/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { analyzePhoto } from '@/lib/claude';
import { saveResult } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, imageMediaType, personaName, personaDescription } =
      await req.json();

    if (!imageBase64 || !personaName || !personaDescription) {
      return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 });
    }

    const analysis = await analyzePhoto(
      imageBase64,
      imageMediaType || 'image/jpeg',
      personaName,
      personaDescription
    );

    const id = await saveResult({
      persona_name: personaName,
      persona_description: personaDescription,
      ...analysis,
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error('analyze error:', error);
    return NextResponse.json({ error: '분석 실패' }, { status: 500 });
  }
}
```

- [ ] **Step 4: API 동작 확인 (curl 테스트)**

```bash
# extract-persona 테스트
curl -X POST http://localhost:3000/api/extract-persona \
  -H "Content-Type: application/json" \
  -d '{"text": "항상 완벽한 걸 추구하고 외모에 굉장히 신경 쓰는 직장 상사야. 남의 스타일 지적을 밥 먹듯이 해."}' | jq .
```

Expected:
```json
{
  "persona_name": "완벽주의 직장 상사",
  "persona_description": "..."
}
```

- [ ] **Step 5: 커밋**

```bash
git add lib/claude.ts app/api/
git commit -m "feat: add Claude API helpers and analyze/extract-persona routes"
```

---

## Task 4: 상태 관리 (URL Params 방식)

**Files:**
- Create: `lib/store.ts`

페이지 간 페르소나 정보를 전달하는 방법으로 sessionStorage를 사용한다 (URL params는 한글/긴 텍스트에 취약).

- [ ] **Step 1: 세션 스토어 헬퍼 생성**

`lib/store.ts`:
```typescript
'use client';

export interface SessionData {
  personaName: string;
  personaDescription: string;
  imageBase64: string;
  imageMediaType: string;
}

export function saveSession(data: Partial<SessionData>) {
  const existing = getSession();
  sessionStorage.setItem('roast_session', JSON.stringify({ ...existing, ...data }));
}

export function getSession(): Partial<SessionData> {
  if (typeof window === 'undefined') return {};
  const raw = sessionStorage.getItem('roast_session');
  return raw ? JSON.parse(raw) : {};
}

export function clearSession() {
  sessionStorage.removeItem('roast_session');
}
```

- [ ] **Step 2: 커밋**

```bash
git add lib/store.ts
git commit -m "feat: add session storage helper for persona/image state"
```

---

## Task 5: 메인 페이지

**Files:**
- Modify: `app/page.tsx`, `app/layout.tsx`

- [ ] **Step 1: layout.tsx 업데이트**

`app/layout.tsx`:
```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '프사 심판관 | AI Profile Roast',
  description: '오늘만큼은 AI가 솔직하게 말해드립니다.',
  openGraph: {
    title: '프사 심판관',
    description: '오늘만큼은 AI가 솔직하게 말해드립니다.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-black text-white">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: 메인 페이지 구현**

`app/page.tsx`:
```typescript
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-6xl">⚖️</div>
      <h1 className="text-4xl font-black mb-3 tracking-tight">
        프사 심판관
      </h1>
      <p className="text-gray-400 text-lg mb-2">
        오늘만큼은 AI가 솔직하게 말해드립니다.
      </p>
      <p className="text-gray-600 text-sm mb-10">
        당신의 프로필 사진, 진짜 첫인상은 어떨까요?
      </p>
      <Link
        href="/persona"
        className="bg-white text-black font-bold text-lg px-8 py-4 rounded-full hover:bg-gray-200 transition-colors"
      >
        판결 시작하기 →
      </Link>
      <p className="mt-6 text-xs text-gray-700">
        ⚠️ 상처받을 준비가 된 분만 클릭하세요
      </p>
    </main>
  );
}
```

- [ ] **Step 3: 브라우저에서 확인**

`http://localhost:3000` 에서 메인 페이지 렌더링 확인.

- [ ] **Step 4: 커밋**

```bash
git add app/page.tsx app/layout.tsx
git commit -m "feat: main page with CTA"
```

---

## Task 6: 페르소나 선택 페이지

**Files:**
- Create: `app/persona/page.tsx`, `components/PersonaCard.tsx`

- [ ] **Step 1: PersonaCard 컴포넌트 생성**

`components/PersonaCard.tsx`:
```typescript
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
```

- [ ] **Step 2: 페르소나 선택 페이지 구현**

`app/persona/page.tsx`:
```typescript
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
```

- [ ] **Step 3: 브라우저에서 확인**

`http://localhost:3000/persona` 에서 카드 선택 및 버튼 동작 확인.

- [ ] **Step 4: 커밋**

```bash
git add app/persona/page.tsx components/PersonaCard.tsx
git commit -m "feat: persona selection page with preset cards"
```

---

## Task 7: 커스텀 페르소나 입력 페이지

**Files:**
- Create: `app/persona/custom/page.tsx`

- [ ] **Step 1: 커스텀 페르소나 페이지 구현**

`app/persona/custom/page.tsx`:
```typescript
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
```

- [ ] **Step 2: 브라우저에서 확인**

`http://localhost:3000/persona/custom` → 텍스트 입력 → API 호출 → 결과 확인 페이지.

- [ ] **Step 3: 커밋**

```bash
git add app/persona/custom/page.tsx
git commit -m "feat: custom persona input page with Claude extraction"
```

---

## Task 8: 사진 업로드 페이지

**Files:**
- Create: `app/upload/page.tsx`

- [ ] **Step 1: 사진 업로드 페이지 구현**

`app/upload/page.tsx`:
```typescript
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getSession, saveSession } from '@/lib/store';

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState('');
  const [imageMediaType, setImageMediaType] = useState('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleFile(file: File) {
    const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
    setImageMediaType(mediaType);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      // base64만 추출 (data:image/jpeg;base64, 제거)
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }

  async function handleSubmit() {
    const session = getSession();
    if (!session.personaName || !imageBase64) return;

    setLoading(true);
    setError('');

    try {
      saveSession({ imageBase64, imageMediaType });

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          imageMediaType,
          personaName: session.personaName,
          personaDescription: session.personaDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push(`/result/${data.id}`);
    } catch (e) {
      setError('분석에 실패했어요. 다시 시도해주세요.');
      setLoading(false);
    }
  }

  if (loading) {
    router.push('/analyzing');
    return null;
  }

  return (
    <main className="min-h-screen px-4 py-10 max-w-lg mx-auto">
      <h1 className="text-2xl font-black mb-1">사진 업로드</h1>
      <p className="text-gray-400 text-sm mb-6">
        판결받을 프로필 사진을 올려주세요
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-gray-700 rounded-2xl overflow-hidden cursor-pointer hover:border-gray-500 transition-colors"
        style={{ minHeight: 280 }}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" style={{ minHeight: 280 }} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-16 text-gray-600">
            <div className="text-5xl mb-3">📸</div>
            <p className="text-sm">클릭하거나 사진을 드래그하세요</p>
            <p className="text-xs mt-1">JPG, PNG, WEBP 지원</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!imageBase64}
        className="w-full mt-6 bg-white text-black font-bold py-4 rounded-full disabled:opacity-30 hover:bg-gray-200 transition-colors"
      >
        판결 받기 ⚖️
      </button>
    </main>
  );
}
```

- [ ] **Step 2: 브라우저에서 확인**

`http://localhost:3000/upload` → 사진 선택 → 미리보기 → "판결 받기" 클릭 → 분석 API 호출.

- [ ] **Step 3: 커밋**

```bash
git add app/upload/page.tsx
git commit -m "feat: photo upload page with drag and drop"
```

---

## Task 9: 로딩 페이지

**Files:**
- Create: `app/analyzing/page.tsx`

- [ ] **Step 1: 로딩 페이지 구현**

`app/analyzing/page.tsx`:
```typescript
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
```

- [ ] **Step 2: 커밋**

```bash
git add app/analyzing/page.tsx
git commit -m "feat: analyzing loading page with rotating messages"
```

---

## Task 10: 결과 페이지

**Files:**
- Create: `app/result/[id]/page.tsx`, `components/ResultCard.tsx`, `components/ShareButtons.tsx`

- [ ] **Step 1: ShareButtons 컴포넌트 생성**

`components/ShareButtons.tsx`:
```typescript
'use client';

import { useRef } from 'react';

interface Props {
  resultId: string;
  cardRef: React.RefObject<HTMLDivElement>;
}

export default function ShareButtons({ resultId, cardRef }: Props) {
  async function handleCopyLink() {
    const url = `${window.location.origin}/result/${resultId}`;
    await navigator.clipboard.writeText(url);
    alert('링크 복사 완료! 친구에게 보내보세요 😈');
  }

  async function handleSaveImage() {
    if (!cardRef.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = 'profile-roast.png';
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert('이미지 저장 실패. 스크린샷으로 저장해주세요!');
    }
  }

  return (
    <div className="flex gap-3 w-full">
      <button
        onClick={handleCopyLink}
        className="flex-1 border border-gray-700 text-gray-300 font-medium py-3 rounded-full hover:border-gray-500 transition-colors text-sm"
      >
        🔗 링크 복사
      </button>
      <button
        onClick={handleSaveImage}
        className="flex-1 border border-gray-700 text-gray-300 font-medium py-3 rounded-full hover:border-gray-500 transition-colors text-sm"
      >
        💾 이미지 저장
      </button>
    </div>
  );
}
```

- [ ] **Step 2: ResultCard 컴포넌트 생성**

`components/ResultCard.tsx`:
```typescript
import { RoastResult } from '@/lib/types';
import { forwardRef } from 'react';

interface Props {
  result: RoastResult;
}

const ResultCard = forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const scoreColor =
    result.score < 0
      ? 'text-red-400'
      : result.score < 50
      ? 'text-yellow-400'
      : 'text-green-400';

  return (
    <div
      ref={ref}
      className="bg-gray-950 border border-gray-800 rounded-3xl p-6 w-full"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-gray-600 tracking-widest uppercase">
          AI Profile Roast
        </span>
      </div>

      {/* 페르소나 */}
      <div className="text-xs text-gray-500 mb-1">심판관</div>
      <div className="font-bold text-base mb-5">{result.persona_name}</div>

      {/* 점수 */}
      <div className="text-xs text-gray-500 mb-1">호감도 점수</div>
      <div className={`text-5xl font-black mb-1 ${scoreColor}`}>
        {result.score.toLocaleString()}점
      </div>
      <div className="text-sm text-gray-500 mb-5">{result.score_label}</div>

      {/* 첫인상 */}
      <div className="text-xs text-gray-500 mb-1">첫인상</div>
      <div className="text-sm text-white mb-5 leading-relaxed">
        "{result.first_impression}"
      </div>

      {/* 속마음 */}
      <div className="text-xs text-gray-500 mb-2">😈 솔직한 속마음</div>
      <ul className="space-y-2 mb-5">
        {result.inner_thoughts.map((thought, i) => (
          <li key={i} className="text-sm text-gray-300 flex gap-2">
            <span className="text-gray-600 shrink-0">{i + 1}.</span>
            <span>{thought}</span>
          </li>
        ))}
      </ul>

      {/* 착한 말 */}
      <div className="border-t border-gray-800 pt-4">
        <div className="text-xs text-gray-500 mb-1">😇 실제로 해줄 말</div>
        <div className="text-sm text-gray-400 italic">"{result.kind_comment}"</div>
      </div>
    </div>
  );
});

ResultCard.displayName = 'ResultCard';
export default ResultCard;
```

- [ ] **Step 3: 결과 페이지 구현**

`app/result/[id]/page.tsx`:
```typescript
import { getResult } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ResultPageClient from './ResultPageClient';

export default async function ResultPage({ params }: { params: { id: string } }) {
  const result = await getResult(params.id);
  if (!result) notFound();

  return <ResultPageClient result={result} />;
}
```

`app/result/[id]/ResultPageClient.tsx`:
```typescript
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
```

- [ ] **Step 4: 전체 플로우 E2E 확인**

1. `http://localhost:3000` → 판결 시작하기
2. 페르소나 선택 (프리셋)
3. 사진 업로드
4. 결과 페이지 확인
5. 링크 복사 → 새 탭에서 열어 결과 동일 확인

- [ ] **Step 5: 커밋**

```bash
git add app/result/ components/ResultCard.tsx components/ShareButtons.tsx
git commit -m "feat: result page with share buttons"
```

---

## Task 11: Vercel 배포

**Files:**
- Create: `next.config.js` (이미지 설정)

- [ ] **Step 1: next.config.js 확인/수정**

`next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 2: Vercel 배포**

```bash
npx vercel --prod
```

프롬프트:
- Set up and deploy? → `Y`
- Which scope? → 본인 계정 선택
- Link to existing project? → `N`
- Project name? → `ai-profile-roast`
- In which directory is your code located? → `./`

- [ ] **Step 3: Vercel 환경변수 설정**

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables:
- `ANTHROPIC_API_KEY` = 실제 키
- `NEXT_PUBLIC_SUPABASE_URL` = Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase anon key

- [ ] **Step 4: 재배포**

```bash
npx vercel --prod
```

- [ ] **Step 5: 프로덕션 URL에서 전체 플로우 확인**

배포된 URL에서 처음부터 끝까지 동작 확인. Supabase 결과 저장 및 공유 링크 동작 확인.

- [ ] **Step 6: 최종 커밋 + 푸시**

```bash
git add -A
git commit -m "feat: production deployment ready"
git push
```

---

## Self-Review

**Spec coverage 체크:**
- ✅ 메인 페이지 (Task 5)
- ✅ 페르소나 선택 프리셋 (Task 6)
- ✅ 커스텀 페르소나 입력 + Claude 추출 (Task 7)
- ✅ 사진 업로드 (Task 8)
- ✅ 로딩 페이지 (Task 9)
- ✅ Claude Vision 분석 (Task 3)
- ✅ Supabase 저장 + 공유 링크 (Task 2, 3)
- ✅ 결과 카드 (점수, 속마음, 착한 말) (Task 10)
- ✅ 링크 복사 + 이미지 저장 (Task 10)
- ✅ Vercel 배포 (Task 11)

**타입 일관성:**
- `RoastResult` — `lib/types.ts`에 정의, 모든 Task에서 동일 사용
- `saveResult` — `Omit<RoastResult, 'id' | 'created_at'>` 파라미터, `analyze/route.ts`와 일치
- `analyzePhoto` — 반환값이 `RoastResult`의 서브셋, `analyze/route.ts`에서 spread로 저장
- `SessionData` — `lib/store.ts`에 정의, upload/persona 페이지에서 동일 사용

**플로우 검증:**
- upload page: API 호출 완료 전 `/analyzing`으로 이동 처리 — `setLoading(true)` 후 `router.push('/analyzing')` 호출하므로 실제 결과는 API 완료 후 `/result/[id]`로 리다이렉트. 단, 현재 구조상 `/analyzing`과 실제 API 호출이 분리되어 있어 결과 UUID를 받은 뒤 리다이렉트가 `upload/page.tsx`에서 직접 일어남. `/analyzing`은 사용자 경험용 전환 화면으로만 활용됨.
