# 프사각 📐

> "이거 프사각?" SNS에 등록할 프로필 사진 때문에 고민해본 적 있으신가요?

프사각은 내가 관심 있는 그 사람의 시각으로 내 프사의 고백각을 측정해주는 서비스입니다.
사진 한 장으로 호감도가 오를지, 폭락할지 지금 바로 확인해보세요.

🔗 **[ttalkkakthon.vercel.app](https://ttalkkakthon.vercel.app)**

---

## 해결하는 문제

"이 사진 괜찮아?"라고 물어봐도 형식적인 답변만 돌아옵니다.
프사각은 내가 신경 쓰이는 그 사람의 시각으로 솔직한 반응을 시뮬레이션해, 이 사진으로 고백각이 나오는가를 객관적으로 판단할 수 있게 합니다.

**타겟 사용자**
- 만우절을 빌미로 평소 관심 있는 상대에게 고백각을 재고 싶은 사람들
- 재밌는 프로필 사진 판별을 받아보고 싶은 MZ세대

---

## 서비스 플로우

```
페르소나 선택 → 사진 업로드 → 고백각 측정 중 → 결과 카드 공유
```

결과 카드는 고유 URL(`/result/[id]`)과 1:1 이미지로 SNS 공유 가능.

---

## 핵심 기능

### 1. 페르소나 설정
프리셋 3종 또는 커스텀 페르소나를 선택합니다.

| 페르소나 | 설명 |
|----------|------|
| 🌻 황용식 | 동백꽃 필 무렵. 충청도 사투리, 과한 찬양 공세, 눈치 제로 직진남 |
| 👑 구준표 | 꽃보다 남자. 틀린 사자성어, 선민의식 가득한 재벌 후계자 |
| 🥊 고동만 | 쌈마이웨이. 무릎 늘어난 트레이닝복으로 소개팅 나온 소꿉친구 |
| ✏️ 직접 입력 | 관심 있는 실제 인물의 성격·말투·호불호를 입력하면 AI가 페르소나 생성 |

### 2. 사진 업로드
프로필 사진을 업로드하면 Claude Vision API가 표정·각도·조명·옷차림 등 실제 관찰 요소를 선택한 페르소나의 시각으로 분석합니다.

### 3. 고백각 측정 결과
호감도 점수(+/-), 고백각 판정, 페르소나의 솔직한 속마음 3줄과 한마디를 결과 카드로 제공합니다.

```json
{
  "score": 350,
  "score_label": "나쁘지 않음",
  "first_impression": "첫인상 한 줄 (반말, 킹받지만 웃긴 톤)",
  "inner_thoughts": ["속마음 1", "속마음 2", "속마음 3"],
  "kind_comment": "그래도 착하게 해줄 말 1줄"
}
```

---

## AI 활용 구조

### 프리셋 선택 시 (1회 호출)

```
사진 + 페르소나 description + viewpoint → Claude Vision API → 결과 JSON
```

### 직접 입력 시 (2회 호출)

```
1차: 인물 설명 텍스트 → Claude Text API → 페르소나 추출 (name + description + viewpoint)
2차: 사진 + 추출된 페르소나 → Claude Vision API → 결과 JSON
```

---

## 페르소나 설계 원칙

| 필드 | 용도 | 사용자 공개 |
|------|------|------------|
| `description` | 페르소나 선택 화면에 보여주는 소개글 | ✅ 공개 |
| `viewpoint` | Claude 프롬프트에만 주입되는 행동 지침 | ❌ 비공개 |

`viewpoint`에는 말투·판단 기준·score 기준·first_impression 작성 방식 등 캐릭터별 구체적 행동 지침이 담깁니다. 이 분리 설계가 페르소나마다 다른 결과를 만드는 핵심입니다.

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 스타일 | Tailwind CSS |
| AI | Claude API (`claude-sonnet-4-6`), Vision + Text |
| DB | Supabase (결과 저장 + 공유 링크) |
| 배포 | Vercel |
| 이미지 압축 | Canvas API — 800px / JPEG 85% (Vision API 비용 절감) |
| 결과 이미지 | html-to-image (1:1 SNS 공유용) |

---

## 차별점

기존 AI 사진 평가 서비스는 객관적 점수를 제공하지만, 프사각은 내가 지정한 특정 인물의 시각으로 평가받는 개인화 경험이 차별점입니다. 결과를 고유 URL과 1:1 이미지로 공유할 수 있어 바이럴 구조를 갖췄으며, 향후 연예인·캐릭터 페르소나 확장 및 글로벌 서비스로의 발전 가능성이 있습니다.

---

## 로컬 실행

```bash
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
