import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function extractPersona(text: string): Promise<{
  persona_name: string;
  persona_description: string;
  persona_viewpoint: string;
}> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [
      {
        role: 'user',
        content: `다음 텍스트(카카오톡 대화 or 설명)를 분석해서 이 사람의 페르소나를 추출해줘.

텍스트:
${text}

JSON으로만 답해줘 (다른 텍스트 없이). 각 필드는 반드시 아래 글자 수 제한을 지켜:
{
  "persona_name": "관계+특징 10자 이내. 예: '차가운 전 연인', '완벽주의 상사'",
  "persona_description": "성격·외모 기준·말투 특징을 1~2문장, 60자 이내.",
  "persona_viewpoint": "프사 평가 행동 지침. 판단 기준·말투·score 기준을 포함해. 200자 이내로 핵심만."
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  return JSON.parse(content.text.replace(/^```json\s*/m, '').replace(/```\s*$/m, '').trim());
}

export async function analyzePhoto(
  imageBase64: string,
  imageMediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
  personaName: string,
  personaDescription: string,
  personaViewpoint?: string
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

${personaViewpoint ? `[평가 관점]\n${personaViewpoint}\n` : ''}
이 사람이 소개팅 or SNS에 올리려는 프로필 사진을 봤어. 아래 항목들을 실제로 사진에서 관찰한 내용을 바탕으로 평가해:

- 표정과 눈빛: 어떤 감정/인상을 주는지
- 각도와 구도: 셀카인지, 어떤 각도인지, 연출이 느껴지는지
- 조명과 배경: 어디서 찍었는지, 배경 선택이 적절한지
- 옷차림과 스타일링: 첫 만남에 이 옷을 입고 나올 사람인지
- 전체적인 분위기: 이 사진으로 소개팅 나올 사람 어떤 사람일 것 같은지

위 관찰 내용을 바탕으로, 너의 페르소나 시각에서 솔직하게 반응해줘. 위로하거나 순화하지 마.

JSON으로만 답해줘 (다른 텍스트 없이):
{
  "score": <정수. 사진 보고 받은 인상 기준. 끔찍하면 -99999도 가능, 최고는 100. 극단적인 숫자 써도 됨>,
  "score_label": <점수 한 줄 레이블. 예: "폭망", "처참", "글쎄...", "나쁘지 않음", "합격", "대박">,
  "first_impression": <이 페르소나가 사진을 딱 봤을 때의 솔직한 첫 반응 한 줄. 반말. 사진에서 실제로 보이는 것을 언급할 것>,
  "inner_thoughts": [<사진을 보며 이 페르소나가 속으로 생각할 것들. 정확히 3개. 반말. 표정/각도/배경/옷차림 등 실제 관찰한 내용을 섞어서. 독설이지만 웃겨야 함>],
  "kind_comment": <그래도 착하게 해줄 말 1줄. 속마음과 대비되는 위로. 반말>
}`,
          },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  return JSON.parse(content.text.replace(/^```json\s*/m, '').replace(/```\s*$/m, '').trim());
}
