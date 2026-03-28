# 프사 심판관 — Design Spec

**Date:** 2026-03-28
**Service:** 프사 심판관 (AI Profile Roast)
**Concept:** 만우절 이벤트 서비스. 내가 좋아하는 사람의 페르소나를 설정하고, 그 사람이 내 프로필 사진을 봤을 때의 솔직한 첫인상을 AI로 시뮬레이션.
**Tone:** 위로하거나 순화하지 않는다. 킹받지만 웃기고 공유하고 싶어지는 톤.
**Status:** ✅ MVP 배포 완료 — https://ttalkkakthon.vercel.app
**Repo:** https://github.com/zzarru/ai-profile-roast

---

## 1. 사용자 플로우

```
메인 페이지 (/)
  → 페르소나 선택 (/persona)
      → [직접 만들기] 페르소나 입력 (/persona/custom)
  → 사진 업로드 (/upload)
  → 분석 중 (/analyzing)
  → 결과 페이지 (/result/[id]) ← 공유 링크
```

---

## 2. 페이지 구성

### ① 메인 페이지 (`/`)
- 서비스 소개 카피: "오늘만큼은 AI가 솔직하게 말해드립니다"
- "판결 시작하기" CTA 버튼

### ② 페르소나 선택 (`/persona`)
- **프리셋 6종** (2열 그리드 카드):
  - 👔 현실주의 직장인
  - 🎨 감성적인 예술가
  - 💪 활동적인 운동파
  - 👗 까다로운 패션 에디터
  - 🥶 차가운 전 연인
  - 👵 엄격한 할머니
- **직접 만들기** 버튼 → `/persona/custom`

### ③ 커스텀 페르소나 입력 (`/persona/custom`)
- 3단계 UI: 입력 → 로딩 → 확인
- 자유 텍스트 or 카카오톡 대화 붙여넣기
- Claude Text API로 페르소나 추출 후 사용자 확인

### ④ 사진 업로드 (`/upload`)
- Drag & drop + 파일 선택
- **클라이언트 사이드 리사이즈**: Canvas API로 800px 이하 압축 (JPEG 85%)
- 비용 절감 + 속도 개선 목적

### ⑤ 로딩 (`/analyzing`)
- 재밌는 카피 1.8초 간격 순환
- 실제 분석은 upload page에서 시작, 완료 시 result로 리다이렉트

### ⑥ 결과 페이지 (`/result/[id]`)
- Supabase에서 결과 로드 (SSR)
- **결과 카드**: 페르소나명 / 호감도 점수 / score_label / 첫인상 / 속마음 3~5줄 / 착한 말 1줄
- 공유: 링크 복사 / 이미지 저장 (html-to-image)

---

## 3. API 설계

### `POST /api/extract-persona`
```json
// Request
{ "text": "자유 텍스트 or 카카오톡 대화" }

// Response
{
  "persona_name": "까다로운 전 직장 상사",
  "persona_description": "완벽주의자, 외모 기준 높음"
}
```

### `POST /api/analyze`
```json
// Request
{
  "imageBase64": "...",
  "imageMediaType": "image/jpeg",
  "personaName": "현실주의 직장인",
  "personaDescription": "..."
}

// Response
{ "id": "uuid" }
```

---

## 4. 데이터 모델 (Supabase)

### `results` 테이블
| 컬럼 | 타입 |
|------|------|
| id | uuid PK |
| created_at | timestamp |
| persona_name | text |
| persona_description | text |
| score | integer |
| score_label | text |
| first_impression | text |
| inner_thoughts | jsonb |
| kind_comment | text |

> 사진은 저장하지 않음 (개인정보 보호)

RLS: Public read + Public insert 허용

---

## 5. 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 스타일링 | Tailwind CSS |
| AI | Claude API (claude-sonnet-4-6), Vision + Text |
| DB | Supabase |
| 배포 | Vercel |
| 이미지 저장 | html-to-image |
| 이미지 압축 | Canvas API (클라이언트 사이드) |

---

## 6. Claude API 호출 전략

- **프리셋:** 사진 + 페르소나 → 1회 Vision 호출
- **직접 입력:** 텍스트 분석 (1차) → Vision 평가 (2차), 총 2회
- 응답은 JSON 구조화 출력 요청
- 마크다운 코드블록 자동 제거 처리 (`extractPersona`, `analyzePhoto` 둘 다)

---

## 7. Git 커밋 컨벤션

gitmoji 스타일 사용. 예: `✨ Feat: 이미지 업로드 기능 구현`

주요 이모지:
- ✨ 새 기능 | 🐛 버그 수정 | 💄 UI/스타일 | ♻️ 리팩터
- 📝 문서 | 🚀 배포 | ⚡️ 성능 | 💬 텍스트/프롬프트
- 🩹 간단한 수정 | 🎨 코드 구조

---

## 8. 다음 개선 과제

- [ ] UI/UX 개선 — 결과 카드 디자인 퀄리티 향상
- [ ] 프리셋 페르소나 설명 고도화 — 더 킹받는 톤으로
- [ ] Claude 프롬프트 튜닝 — 속마음 품질 향상
- [ ] OG 이미지 — 링크 미리보기 지원
- [ ] 스트리밍 — 실시간 결과 타이핑 효과
