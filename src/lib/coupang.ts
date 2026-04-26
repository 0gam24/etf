/**
 * Coupang Partners Open API client.
 *
 *   - HMAC SHA-256 서명 + 헤더 구성
 *   - products/search · deeplink · bestcategories
 *   - 자체 in-process rate limiter (시간당 10회 한도, 보수적으로 8회로 cap)
 *   - dev/build 시점에서만 사용 (Cloudflare runtime 노출 X)
 *
 *   ⚠️ 환경변수:
 *     - COUPANG_PARTNERS_ACCESS_KEY
 *     - COUPANG_PARTNERS_SECRET_KEY
 *     누락 시 모든 함수가 throw — 호출자(fetch-products.mjs)에서 dry-run 폴백.
 */

import { createHmac } from 'node:crypto';

const HOST = 'https://api-gateway.coupang.com';
const ROOT = '/v2/providers/affiliate_open_api/apis/openapi/v1';

interface AuthEnv {
  accessKey: string;
  secretKey: string;
}

function getAuth(): AuthEnv {
  const accessKey = process.env.COUPANG_PARTNERS_ACCESS_KEY;
  const secretKey = process.env.COUPANG_PARTNERS_SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error(
      'Coupang Partners credentials missing. Set COUPANG_PARTNERS_ACCESS_KEY and COUPANG_PARTNERS_SECRET_KEY in .env.local (or GitHub Secrets for CI).',
    );
  }
  return { accessKey, secretKey };
}

/** signed-date 형식: YYMMDDTHHmmssZ (Coupang 사양) */
function buildSignedDate(now = new Date()): string {
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mi = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');
  return `${yy}${mm}${dd}T${hh}${mi}${ss}Z`;
}

/** Authorization 헤더 생성. Coupang 형식: CEA algorithm=HmacSHA256, access-key=..., signed-date=..., signature=... */
function buildAuthHeader(method: 'GET' | 'POST', pathWithQuery: string, auth: AuthEnv): string {
  const signedDate = buildSignedDate();
  // path와 query 분리
  const [pathOnly, query = ''] = pathWithQuery.split('?');
  const message = `${signedDate}${method}${pathOnly}${query}`;
  const signature = createHmac('sha256', auth.secretKey).update(message).digest('hex');
  return `CEA algorithm=HmacSHA256, access-key=${auth.accessKey}, signed-date=${signedDate}, signature=${signature}`;
}

// ── Rate limiter (in-process, 시간당 8회 cap — 한도 10에서 여유 2) ──
const callTimestamps: number[] = [];
const HOUR_MS = 60 * 60 * 1000;
const HOURLY_CAP = 8;

async function throttle(): Promise<void> {
  const now = Date.now();
  // 1시간 이전 호출 제거
  while (callTimestamps.length && now - callTimestamps[0] > HOUR_MS) callTimestamps.shift();
  if (callTimestamps.length >= HOURLY_CAP) {
    const waitMs = HOUR_MS - (now - callTimestamps[0]) + 1000;
    console.warn(`[coupang] rate limit reached (${HOURLY_CAP}/h). Waiting ${Math.round(waitMs / 1000)}s...`);
    await new Promise(r => setTimeout(r, waitMs));
    return throttle();
  }
  callTimestamps.push(now);
}

async function request<T>(method: 'GET' | 'POST', pathWithQuery: string, body?: unknown): Promise<T> {
  await throttle();
  const auth = getAuth();
  const url = `${HOST}${ROOT}${pathWithQuery}`;
  const fullPath = `${ROOT}${pathWithQuery}`;
  const headers: Record<string, string> = {
    Authorization: buildAuthHeader(method, fullPath, auth),
    'Content-Type': 'application/json;charset=UTF-8',
  };
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Coupang API ${method} ${pathWithQuery} → HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

// ── Public types ──

export interface CoupangProduct {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  keyword?: string;
  rank?: number;
  isRocket?: boolean;
  isFreeShipping?: boolean;
  /** 일부 응답에만 포함 — 별점/리뷰는 search API에 안 들어가는 경우가 많아 Optional */
  ratingAverage?: number;
  ratingCount?: number;
  categoryName?: string;
}

interface SearchResponse {
  rCode: string;
  rMessage: string;
  data: { productData: CoupangProduct[]; landingUrl: string };
}

interface DeeplinkRequest {
  coupangUrls: string[];
}

interface DeeplinkResponse {
  rCode: string;
  rMessage: string;
  data: Array<{
    originalUrl: string;
    shortenUrl: string;
    landingUrl: string;
  }>;
}

interface BestCategoriesResponse {
  rCode: string;
  rMessage: string;
  data: CoupangProduct[];
}

// ── Public API ──

/**
 * 키워드 검색.
 *   limit: 최대 50, 기본 10. 응답엔 productImage·productUrl 포함, productUrl은 이미 단축 deeplink.
 */
export async function searchProducts(keyword: string, limit = 10): Promise<CoupangProduct[]> {
  const params = new URLSearchParams({
    keyword,
    limit: String(Math.min(Math.max(1, limit), 50)),
  });
  const path = `/products/search?${params.toString()}`;
  const res = await request<SearchResponse>('GET', path);
  if (res.rCode !== '0') {
    console.warn(`[coupang] search "${keyword}" responded rCode=${res.rCode} ${res.rMessage}`);
    return [];
  }
  return res.data?.productData || [];
}

/**
 * 임의의 쿠팡 상품 URL을 단축 deeplink로 변환.
 *   주로 검색 응답에 productUrl이 이미 들어 있어 별도 호출 불필요.
 *   수동 큐레이션 시(특정 상품 페이지 URL을 카드로 만들고 싶을 때) 사용.
 */
export async function createDeeplinks(coupangUrls: string[]): Promise<DeeplinkResponse['data']> {
  if (!coupangUrls.length) return [];
  const path = `/deeplink`;
  const res = await request<DeeplinkResponse>('POST', path, { coupangUrls } as DeeplinkRequest);
  if (res.rCode !== '0') {
    console.warn(`[coupang] deeplink responded rCode=${res.rCode} ${res.rMessage}`);
    return [];
  }
  return res.data || [];
}

/**
 * 베스트 카테고리 상품 조회.
 *   categoryId: 쿠팡 카테고리 ID. 책 = 178133 (도서, 변경 가능)
 */
export async function getBestCategories(categoryId: number, limit = 20): Promise<CoupangProduct[]> {
  const params = new URLSearchParams({
    limit: String(Math.min(Math.max(1, limit), 100)),
  });
  const path = `/products/bestcategories/${categoryId}?${params.toString()}`;
  const res = await request<BestCategoriesResponse>('GET', path);
  if (res.rCode !== '0') {
    console.warn(`[coupang] bestcategories ${categoryId} responded rCode=${res.rCode} ${res.rMessage}`);
    return [];
  }
  return res.data || [];
}

/** 호출 가능 여부 (자격증명만 확인, 실제 호출 X) */
export function isConfigured(): boolean {
  return Boolean(process.env.COUPANG_PARTNERS_ACCESS_KEY && process.env.COUPANG_PARTNERS_SECRET_KEY);
}
