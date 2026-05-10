#!/usr/bin/env node
/**
 * Today — 매일 발행 일지 자동 생성.
 *
 *   출력: today.md (repo 루트)
 *   목적: 운영자가 매일 한 눈에 "오늘 뭐가 새로 발행됐나" 파악.
 *
 *   갱신 시점:
 *     - GitHub Actions `daily-pulse.yml` 평일 16:00 KST (KRX 마감 후 30분)
 *       → pipeline 실행 후 today.md 재생성 → content/ 와 함께 commit·push
 *     - 수동: `npm run generate:today`
 *
 *   today.md 구조:
 *     1. 매일 자동 업데이트되는 것들 (설명)
 *     2. 최근 7일 발행 (날짜별 그룹, 카테고리별 link)
 *     3. 총 누적 카운트
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const CONTENT_DIR = path.join(ROOT, 'content');
const OUT_FILE = path.join(ROOT, 'today.md');
const KRX_FILE = path.join(ROOT, 'data', 'krx-etf-codes.json');

const SITE = 'https://iknowhowinfo.com';

const CATEGORIES = [
  { key: 'pulse',    label: '오늘의 관전포인트',  icon: '🌅' },
  { key: 'surge',    label: '급등 테마 분석',     icon: '🚀' },
  { key: 'flow',     label: '자금 흐름 리포트',   icon: '💧' },
  { key: 'income',   label: '월배당·커버드콜',    icon: '💰' },
  { key: 'breaking', label: 'ETF 속보',           icon: '⚡' },
];

const RECENT_DAYS = 7;

function readEtfCount() {
  if (!fs.existsSync(KRX_FILE)) return 0;
  try {
    return Number(JSON.parse(fs.readFileSync(KRX_FILE, 'utf-8')).count) || 0;
  } catch {
    return 0;
  }
}

function collectPosts() {
  const posts = [];
  for (const { key } of CATEGORIES) {
    const dir = path.join(CONTENT_DIR, key);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => /\.mdx?$/.test(f));
    for (const filename of files) {
      const raw = fs.readFileSync(path.join(dir, filename), 'utf-8');
      const fm = matter(raw).data || {};
      const slug = fm.slug || filename.replace(/\.mdx?$/, '');
      const date = fm.date ? new Date(fm.date) : null;
      if (!date || isNaN(date.getTime())) continue;
      posts.push({
        category: key,
        slug,
        title: fm.title || slug,
        date,
        dateKey: date.toISOString().slice(0, 10), // YYYY-MM-DD
        url: `${SITE}/${key}/${slug}`,
      });
    }
  }
  posts.sort((a, b) => b.date.getTime() - a.date.getTime());
  return posts;
}

function groupByDate(posts) {
  const groups = new Map();
  for (const p of posts) {
    if (!groups.has(p.dateKey)) groups.set(p.dateKey, []);
    groups.get(p.dateKey).push(p);
  }
  return groups;
}

function formatRecent(groups) {
  const recentDates = Array.from(groups.keys()).slice(0, RECENT_DAYS);
  const lines = [];

  for (const dateKey of recentDates) {
    const dayPosts = groups.get(dateKey);
    const total = dayPosts.length;
    lines.push(`### ${dateKey} (총 ${total}편)`);
    lines.push('');

    for (const { key, label, icon } of CATEGORIES) {
      const inCat = dayPosts.filter(p => p.category === key);
      if (inCat.length === 0) continue;

      if (inCat.length === 1) {
        const p = inCat[0];
        lines.push(`- ${icon} **${label}** — [${p.title}](${p.url})`);
      } else {
        lines.push(`- ${icon} **${label}** (${inCat.length}건)`);
        for (const p of inCat) {
          lines.push(`  - [${p.title}](${p.url})`);
        }
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

function nowKstString() {
  const now = new Date();
  // KST = UTC+9
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const kst = new Date(kstMs);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(kst.getUTCDate()).padStart(2, '0');
  const hh = String(kst.getUTCHours()).padStart(2, '0');
  const mm = String(kst.getUTCMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm} KST`;
}

function main() {
  const posts = collectPosts();
  const groups = groupByDate(posts);
  const etfCount = readEtfCount();
  const lastUpdated = nowKstString();
  const totalAll = posts.length;
  const totalRecent = Array.from(groups.entries())
    .slice(0, RECENT_DAYS)
    .reduce((acc, [, ps]) => acc + ps.length, 0);

  const lastPublishedDate = posts[0]?.dateKey || '—';

  const md = `# 📅 Today — Daily ETF Pulse 발행 일지

> 매일 평일 KST 16:00 자동 갱신 (KRX 마감 후 30분).
>
> **마지막 갱신**: ${lastUpdated}
> **마지막 발행일**: ${lastPublishedDate}
> **최근 ${RECENT_DAYS}일 발행**: ${totalRecent}편 / **총 누적**: ${totalAll}편

---

## 🔄 매일 자동 업데이트되는 것들

- **콘텐츠 5종 발행** — 평일 16:00 KST GitHub Actions cron \`daily-pulse.yml\`
  - 🌅 \`pulse\` 오늘의 관전포인트 — 1편/일
  - 🚀 \`surge\` 거래량 1위 ETF 급등 사유 — 1편/일
  - 💧 \`flow\` 섹터 자금 흐름 — 1편/일
  - 💰 \`income\` 월배당·커버드콜 — 1편/일
  - ⚡ \`breaking\` ETF 속보 — 3편/일 (거래량 TOP3)
- **KRX ETF 사전** — 매주 월요일 09:00 KST 신규 ETF 자동 흡수 (현재 ${etfCount}종)
- **\`public/network-mirror.json\`** — 매 빌드마다 자동 재생성 (smartdata HQ sync용)
- **가이드 \`lastReviewed\`** — 매월 1·15일 자동 갱신 (Google freshness 신호)
- **\`today.md\`** (본 파일) — 매일 cron이 본 스크립트 실행해 자동 갱신

---

## 📰 최근 ${RECENT_DAYS}일 발행 (날짜별)

${formatRecent(groups) || '_아직 최근 발행 글이 없습니다._'}

---

## 🗂 카테고리별 누적

${CATEGORIES.map(({ key, label, icon }) => {
  const n = posts.filter(p => p.category === key).length;
  return `- ${icon} **${label}** (\`/${key}\`) — ${n}편`;
}).join('\n')}

---

_본 파일은 [scripts/generate-today.mjs](scripts/generate-today.mjs)이 자동 생성합니다. 수동 편집 금지 — 다음 cron 실행 시 덮어쓰입니다._
`;

  fs.writeFileSync(OUT_FILE, md, 'utf-8');
  console.log(`[today] ${OUT_FILE} 생성 완료`);
  console.log(`   - 최근 ${RECENT_DAYS}일: ${totalRecent}편 / 총 누적: ${totalAll}편`);
  console.log(`   - 마지막 발행일: ${lastPublishedDate}`);
  console.log(`   - 마지막 갱신: ${lastUpdated}`);
}

main();
