# 프사 심판관 ⚖️

> "오늘만큼은 AI가 솔직하게 말해드립니다."

프로필 사진을 업로드하면, 내가 선택한 페르소나가 AI로 솔직하게 평가해주는 만우절 서비스.

🔗 **[ttalkkakthon.vercel.app](https://ttalkkakthon.vercel.app)**

---

## 서비스 플로우

```
메인 → 심판관 선택 → 사진 업로드 → 분석 중 → 결과 카드
```

결과 카드는 고유 URL(`/result/[id]`)로 공유 가능.

---

## AI 활용 구조

### 1. 프리셋 선택 시 (1회 호출)

```
사진 + 페르소나 description + viewpoint → Claude Vision API → 판결 JSON
```

### 2. 직접 만들기 선택 시 (2회 호출)

```
1차: 텍스트/카톡 내용 → Claude Text API → 페르소나 추출
2차: 사진 + 추출된 페르소나 → Claude Vision API → 판결 JSON
```

### 결과 JSON 구조

```json
{
  "score": -4200,
  "score_label": "폭망",
  "first_impression": "첫인상 한 줄 (반말, 킹받지만 웃긴 톤)",
  "inner_thoughts": ["속마음 1", "속마음 2", "속마음 3"],
  "kind_comment": "그래도 착하게 해줄 말 1줄"
}
```

---

## 페르소나 설계 원칙

프리셋 페르소나는 두 가지 필드로 구분해서 설계한다.

| 필드 | 용도 | 사용자 공개 |
|------|------|------------|
| `description` | 페르소나 선택 화면에 보여주는 소개글 | ✅ 공개 |
| `viewpoint` | Claude 프롬프트에만 주입되는 행동 지침 | ❌ 비공개 |

**`description`** — 사용자가 "이 페르소나를 선택할까?" 판단할 때 보는 소개글. 짧고 흥미롭게.

**`viewpoint`** — Claude가 실제로 평가할 때 따르는 구체적 행동 지침. "이 관점에서, 이런 포인트로, 이런 톤으로 평가해"가 들어감. 페르소나별로 다른 viewpoint가 결과의 차별성을 만든다.

### 현재 프리셋 3종

| 페르소나 | 핵심 관점 |
|----------|-----------|
| 🥀 전 연인 | 재회 가치 판단, 새 애인과 비교, 연락할까 말까 갈등 |
| 🌟 우리과 인기선배 | 후배 프사 심사, 내 스타일인지 0.3초 판단 |
| 🫂 소꿉친구 | 오랜 친구만 아는 진실, 연출과 실제의 차이 폭로 |

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 스타일 | Tailwind CSS |
| AI | Claude API (`claude-sonnet-4-6`), Vision + Text |
| DB | Supabase (결과 저장 + 공유 링크) |
| 배포 | Vercel |
| 이미지 압축 | Canvas API — 800px / JPEG 85% (비용 절감) |
| 이미지 저장 | html-to-image |

---

## Git 커밋 컨벤션

[gitmoji](https://gitmoji.dev/) 스타일 사용.

```
✨ Feat: 새 기능 설명
🐛 Fix: 버그 수정 내용
💄 Style: UI/스타일 변경
♻️ Refactor: 리팩터링
📝 Docs: 문서 업데이트
🚀 Deploy: 배포
⚡️ Perf: 성능 개선
💬 Content: 텍스트/프롬프트 수정
```

---

## 로컬 실행

```bash
# 환경변수 설정
cp .env.local.example .env.local
# ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 입력

npm install
npm run dev
```

## Supabase 테이블

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

alter table results enable row level security;
create policy "Public read" on results for select using (true);
create policy "Public insert" on results for insert with check (true);
```
