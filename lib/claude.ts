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

  return JSON.parse(content.text.replace(/^```json\s*/m, '').replace(/```\s*$/m, '').trim());
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

  return JSON.parse(content.text.replace(/^```json\s*/m, '').replace(/```\s*$/m, '').trim());
}
