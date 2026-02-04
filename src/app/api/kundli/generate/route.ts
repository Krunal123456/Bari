import { NextResponse } from 'next/server';
import { generateKundliMatch } from '@/lib/kundli';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dobA, tobA, pobA, dobB, tobB, pobB, requestorId, allowedToSeePdf } = body;

    // Basic validation
    if (!dobA || !dobB) {
      return NextResponse.json({ success: false, error: 'Missing required DOBs' }, { status: 400 });
    }

    // Call internal generator (or Cloud Function) — for now this is simulated
    const result = await generateKundliMatch(dobA, tobA, pobA, dobB, tobB, pobB);

    // In production: store PDF in Firebase Storage using server-side service account and return secure URL

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    console.error('Kundli generate error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
