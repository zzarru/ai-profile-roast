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
