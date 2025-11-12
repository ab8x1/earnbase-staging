// app/api/revalidate/route.js
import { NextResponse, NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ revalidated: false, error: 'Invalid secret' }, { status: 401 });
  }
  try {
    revalidatePath('/');
    revalidatePath('/[coin]', 'page');
    revalidatePath('/[coin]/[network]', 'page');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    return NextResponse.json({ revalidated: false, error: error }, { status: 500 });
  }
}
