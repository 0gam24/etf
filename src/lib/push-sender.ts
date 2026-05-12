/**
 * Web Push sender — 인터페이스 정의 + Cloudflare Worker 환경 호환성 안내.
 *
 *   실제 발송은 scripts/send-push.mjs (Node + web-push lib) 가 GitHub Actions cron 에서 실행.
 *   Cloudflare Workers 안에서 ES256 JWT 직접 서명은 SubtleCrypto JWK import 제약으로 복잡 →
 *   cron 기반 단방향 발송으로 단순화.
 *
 *   알림 카테고리: dividend (분배락 D-1) / signal (시그널 trigger) / volatility (변동성 폭증)
 */

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  /** 알림 카테고리 — 구독자 카테고리 필터에 매칭 */
  category: 'dividend' | 'signal' | 'volatility';
}

export interface PushSubscriptionRecord {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  categories: string[];
  createdAt: number;
}
