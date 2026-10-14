import { goneResponse } from '@/lib/gone';

// 예전 도메인의 랭킹 주소 → 410 Gone (src/lib/gone.ts 주석)
export function GET() {
  return goneResponse();
}

export function HEAD() {
  return goneResponse();
}
