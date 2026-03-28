# 프사 심판관 — Design Spec

**Date:** 2026-03-28
**Service:** 프사 심판관 (Profile Judge)
**Concept:** 만우절 이벤트 서비스. 내가 좋아하는 사람의 페르소나를 설정하고, 그 사람이 내 프로필 사진을 봤을 때의 솔직한 첫인상을 AI로 시뮬레이션.
**Tone:** 위로하거나 순화하지 않는다. 킹받지만 웃기고 공유하고 싶어지는 톤.

---

## 1. 사용자 플로우

```
메인 페이지
  → 페르소나 선택 (프리셋 or 직접 만들기)
      → [직접 만들기] 페르소나 입력 페이지
  → 사진 업로드
  → 분석 중 (로딩)
  → 결과 페이지 (/result/[id])
```

---

## 2. 페이지 구성

### ① 메인 페이지 (`/`)
- 서비스 소개 카피 ("오늘만큼은 AI가 솔직하게 말해드립니다")
- "판결 시작하기" CTA 버튼

### ② 페르소나 선택 (`/persona`)
- **프리셋 선택**: 4~6가지 카드 형태
  - 현실주의 직장인
  - 감성적인 예술가
  - 활동적인 운동파
  - 까다로운 패션 에디터
  - 차가운 전 연인
  - (1개 자유 추가 가능)
- **직접 만들기** 버튼 → `/persona/custom`으로 이동

### ③ 커스텀 페르소나 입력 (`/persona/custom`)
- 자유 텍스트 입력 (이 사람은 어떤 사람인지 설명)
- 카카오톡 대화 내용 붙여넣기 지원 (txt 형식)
- "페르소나 분석" 버튼 → `POST /api/extract-persona` 호출
- Claude가 분석 후 페르소나 이름/설명 요약 → 사용자에게 확인 후 다음 단계

### ④ 사진 업로드 (`/upload`)
- 단일 사진 업로드 (drag & drop or 파일 선택)
- 미리보기 표시
- "판결 받기" 버튼 → `POST /api/analyze` 호출 후 `/analyzing`으로 이동

### ⑤ 로딩 (`/analyzing`)
- 재밌는 카피가 순환하는 로딩 화면
  - "심판관이 눈썹을 찌푸리고 있습니다..."
  - "냉정하게 분석 중..."
  - "솔직히 말하기 위해 마음의 준비 중..."
- 분석 완료 시 `/result/[id]`로 자동 리다이렉트

### ⑥ 결과 페이지 (`/result/[id]`)
- Supabase에서 결과 로드
- **결과 카드 구성:**
  - 페르소나 이름/설명
  - 호감도 점수 (과장된 숫자, 예: -10,000점 / "폭망")
  - 솔직한 속마음 3~5줄 (핵심 콘텐츠)
  - 그래도 착하게 해줄 말 1줄 (속마음과의 대비가 포인트)
- **공유:**
  - 이미지로 저장 (html-to-image or canvas)
  - 링크 복사 (현재 URL)
- "다시 판결받기" 버튼

---

## 3. API 설계

### `POST /api/extract-persona`
커스텀 텍스트에서 페르소나 추출

**Request:**
```json
{ "text": "카카오톡 대화 내용 or 자유 텍스트" }
```

**Response:**
```json
{
  "persona_name": "까다로운 전 직장 상사",
  "persona_description": "완벽주의자, 쉽게 만족하지 않음, 외모에 기준이 높음"
}
```

### `POST /api/analyze`
사진 + 페르소나 → 판결 결과 생성 및 Supabase 저장

**Request:**
```json
{
  "image": "base64 encoded image",
  "persona_name": "현실주의 직장인",
  "persona_description": "현실적이고 솔직한 30대 직장인"
}
```

**Response:**
```json
{
  "id": "uuid",
  "score": -10000,
  "score_label": "폭망",
  "first_impression": "첫인상 한 줄",
  "inner_thoughts": [
    "속마음 1",
    "속마음 2",
    "속마음 3"
  ],
  "kind_comment": "그래도 나쁘진 않은 것 같기도 해요"
}
```

---

## 4. 데이터 모델 (Supabase)

### `results` 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 공유 링크용 고유 ID |
| created_at | timestamp | 생성 시각 |
| persona_name | text | 페르소나 이름 |
| persona_description | text | 페르소나 설명 |
| score | integer | 호감도 점수 |
| score_label | text | 점수 레이블 (폭망/처참/보통 등) |
| first_impression | text | 첫인상 한 줄 |
| inner_thoughts | jsonb | 속마음 배열 |
| kind_comment | text | 착한 말 1줄 |

> 사진은 저장하지 않음 (개인정보 이슈 방지)

---

## 5. 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 스타일링 | Tailwind CSS |
| AI | Claude API (claude-sonnet-4-6), Vision + Text |
| DB | Supabase (결과 저장 + 공유 링크) |
| 배포 | Vercel |
| 이미지 저장 | html-to-image 라이브러리 |

---

## 6. Claude API 호출 전략

- **프리셋 선택 시:** 사진 + 페르소나 설명 → 1회 호출
- **직접 입력 시:**
  1. 텍스트 분석 → 페르소나 추출 (1차 호출, text only)
  2. 사진 + 추출된 페르소나 → 판결 (2차 호출, vision)
- 결과는 JSON 모드로 구조화 출력

---

## 7. MVP 우선순위

1. 사진 업로드 → 페르소나 설정 → 결과 카드 플로우 완성
2. Supabase 결과 저장 + `/result/[id]` 공유 링크
3. Vercel 배포
4. 결과 카드 이미지 저장 (시간 여유 시)
5. 스트리밍 (시간 여유 시)
