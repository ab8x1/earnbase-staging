import { type NextRequest } from 'next/server';
import crypto from 'crypto';
import dbConnect from '../../../../../lib/dbConnect';
import { poolsInfoDataType } from '@/helpers/getData/getPropsHelpers';
import Pool from '../../../../../lib/models/Pool';
import { getLastFullHour } from '@/helpers/formatTimeAgo';

export const runtime = 'nodejs'; // use Node runtime
export const dynamic = 'force-dynamic'; // don’t let Next cache the handler

const HEADERS: HeadersInit = {
  // content + caching (1h shared cache; browsers revalidate)
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=60',

  // CORS
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': 'ETag, X-RateLimit-Remaining',
};

export async function OPTIONS() {
  // quick preflight response (no body)
  return new Response(null, { status: 204, headers: HEADERS });
}

async function getVaultsPayload() {
  try {
    await dbConnect();
    const rawPoolData: poolsInfoDataType = (await Pool.find()) || [];
    const updated_at = getLastFullHour();
    return { updated_at, data: rawPoolData };
  } catch (error) {
    console.log(error);
    return { updated_at: Date.now(), data: [] };
  }
}

export async function GET(req: NextRequest) {
  const payload = await getVaultsPayload();
  const body = JSON.stringify(payload);

  // weak ETag from body hash
  const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('base64') + '"';
  const inm = req.headers.get('if-none-match');

  const headers = new Headers(HEADERS);
  headers.set('ETag', etag);

  if (inm && inm === etag) {
    // conditional GET → save bandwidth for clients/CDNs
    return new Response(null, { status: 304, headers });
  }

  return new Response(body, { headers });
}
