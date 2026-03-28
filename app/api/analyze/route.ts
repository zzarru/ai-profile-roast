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
