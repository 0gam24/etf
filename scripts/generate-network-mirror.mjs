#!/usr/bin/env node
/**
 * Network mirror — smartdata HQ 가 본 사이트 페이지 list 를 sync 하기 위한 메타 export.
 *
 *   출력: public/network-mirror.json
 *     {
 *       site, siteName, domain, lastUpdated,
 *       totalPosts: <분석 글 수>,
 *       categories: [pulse, surge, flow, income, breaking],
 *       personas: ['4050-etf-investor'],
 *       authors:  [gold, pink, blue, green, amber, violet, red],   // 7 AI 에이전트 accent
 *       posts: [{ url, title, category, author, persona, publishedAt, summary }, ...],
 *       etfStocksAvailable: <ETF 사전 prerender 수>,                  // posts 와 분리
 *       etfStocksIndexUrl: "https://iknowhowinfo.com/etf/",
 *     }
 *
 *   ⚠️ ETF 종목 사전 1099 prerender 는 totalPosts 에 합산하지 않음 (별도 키).
 *      메인이 "분석 글 수" 신호로 받기 때문 — 1117 표기 시 자매가 유난히 큰 사이트로 편향.
 *
 *   실행: node scripts/generate-network-mirror.mjs
 *     - npm run generate:mirror
 *     - npm run build (prebuild 훅으로 자동 실행)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const CONTENT_DIR = path.join(ROOT, 'content');
const PUBLIC_DIR = path.join(ROOT, 'public');
const KRX_FILE = path.join(ROOT, 'data', 'krx-etf-codes.json');
const OUT_FILE = path.join(PUBLIC_DIR, 'network-mirror.json');

const SITE = 'https://iknowhowinfo.com';

// 분석 글 카테고리 (top-level만 — theme/account 는 추후 확장 시 추가)
const TOP_LEVEL_CATEGORIES = ['pulse', 'surge', 'flow', 'income', 'breaking'];

/**
 * 7 AI 에이전트 authorId → accent color 매핑.
 *   src/lib/authors.ts 의 ACCENT_MAP 과 동기 — 변경 시 양쪽 동시 갱신.
 */
const AUTHOR_ID_TO_ACCENT = {
  pb_kim:          'gold',
  mom_park:        'pink',
  data_lee:        'blue',
  homemaker_jung:  'green',
  biz_cho:         'amber',
  dev_song:        'violet',
  analyst_han:     'red',
};

const AUTHOR_ACCENTS = Object.values(AUTHOR_ID_TO_ACCENT);

function collectPosts() {
  const posts = [];

  for (const category of TOP_LEVEL_CATEGORIES) {
    const dir = path.join(CONTENT_DIR, category);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));

    for (const filename of files) {
      const filepath = path.join(dir, filename);
      const raw = fs.readFileSync(filepath, 'utf-8');
      const parsed = matter(raw);
      const fm = parsed.data || {};

      const slug = fm.slug || filename.replace(/\.mdx?$/, '');
      const authorId = fm.authorId || null;
      // multi-author 글은 author=null (정책). 매핑 누락 시에도 null.
      const author = authorId && AUTHOR_ID_TO_ACCENT[authorId]
        ? AUTHOR_ID_TO_ACCENT[authorId]
        : null;

      posts.push({
        url: `${SITE}/${category}/${slug}`,
        title: fm.title || slug,
        category,
        author,
        persona: '4050-etf-investor',
        publishedAt: fm.date || null,
        summary: typeof fm.description === 'string'
          ? fm.description.slice(0, 200)
          : null,
      });
    }
  }

  // 최신글 우선
  posts.sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return tb - ta;
  });

  return posts;
}

function readEtfCount() {
  if (!fs.existsSync(KRX_FILE)) return 0;
  try {
    const krx = JSON.parse(fs.readFileSync(KRX_FILE, 'utf-8'));
    return Number(krx.count) || 0;
  } catch {
    return 0;
  }
}

function main() {
  if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const posts = collectPosts();
  const etfStocksAvailable = readEtfCount();

  const mirror = {
    site: 'iknowhowinfo',
    siteName: 'iknowhowinfo (Daily ETF Pulse)',
    domain: SITE,
    lastUpdated: new Date().toISOString(),
    totalPosts: posts.length,
    categories: TOP_LEVEL_CATEGORIES,
    personas: ['4050-etf-investor'],
    authors: AUTHOR_ACCENTS,
    posts,
    // ETF 종목 사전 (prerender 별개 키 — totalPosts 폭증 방지)
    etfStocksAvailable,
    etfStocksIndexUrl: `${SITE}/etf/`,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(mirror, null, 2), 'utf-8');

  console.log(`[network-mirror] ${OUT_FILE} 생성 완료`);
  console.log(`   - 분석 글: ${posts.length}편`);
  console.log(`   - ETF 종목 사전 prerender: ${etfStocksAvailable}종 (별도 키)`);
  console.log(`   - 카테고리: ${TOP_LEVEL_CATEGORIES.join(', ')}`);
  console.log(`   - AI 에이전트 accent: ${AUTHOR_ACCENTS.join(', ')}`);
}

main();
