import { NextRequest, NextResponse } from 'next/server';
import { analyzeToken } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mint: string }> }
) {
  const { mint } = await params;

  if (!mint || mint.length < 32 || mint.length > 44) {
    return NextResponse.json({ error: 'Invalid mint address' }, { status: 400 });
  }

  try {
    const report = await analyzeToken(mint);
    return NextResponse.json(report);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? 'Analysis failed' },
      { status: 500 }
    );
  }
}
