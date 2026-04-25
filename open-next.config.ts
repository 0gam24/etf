import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

/**
 * OpenNext Cloudflare 설정.
 *
 *   incrementalCache: SSG로 prerender된 페이지(글 슬러그·테마·계좌·가이드 등)의 결과를
 *   .open-next/assets/cdn-cgi/_next_cache 아래 정적 파일로 굳혀, Cloudflare Workers
 *   Static Assets 바인딩(`ASSETS`)으로 그대로 서빙.
 *
 *   이 설정 없이 build하면 prerender 결과물이 `.open-next/cache/`에만 떨어지고
 *   런타임에서 cache backend(KV/R2)를 못 찾아 모든 SSG 슬러그가 404가 됨.
 *
 *   revalidate 없는 readonly SSG 사이트라 KV/R2 없이 정적 자산만으로 충분.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
