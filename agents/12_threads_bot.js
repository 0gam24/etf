/**
 * 12. ThreadsBot — 발행된 포스트를 Threads에 자동 공유
 *
 *   규칙 (확정된 하루 2회 빈도):
 *     · 오전: pulse 1편
 *     · 오후: flow 또는 income 중 하나 (일별 로테이션 — 짝수일 flow, 홀수일 income)
 *
 *   파이프라인은 한 번 실행될 때 4편을 다 만들지만, Threads 포스팅은 조건부 1~2개만.
 *   scheduler가 오전/오후를 두 번 돌리면 각각 1개씩 나갈 수 있음.
 *
 *   OG 이미지: `/api/og?category=...&title=...` URL을 Threads IMAGE 포스트로 첨부.
 */

const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');
const { postThread } = require('../pipeline/threads_client');

const AGENT_NAME = 'ThreadsBot';

function buildText(published, etfData) {
  const cat = published.category;
  const slug = encodeURIComponent(published.slug);
  const siteUrl = (process.env.SITE_URL || '').replace(/\/+$/, '');
  const url = `${siteUrl}/${cat}/${slug}`;

  if (cat === 'pulse') {
    const top3 = etfData?.byVolume?.slice(0, 3) || [];
    const leader = etfData?.sectorFlow?.[0];
    const lines = [
      '⚡ 오늘의 ETF 관전포인트',
      '',
      top3[0] ? `거래량 1위: ${top3[0].name} ${top3[0].changeRate >= 0 ? '+' : ''}${top3[0].changeRate}%` : '',
      leader ? `섹터 리더: ${leader.sector} ${leader.avgChangeRate >= 0 ? '+' : ''}${leader.avgChangeRate}%` : '',
      '',
      `→ ${url}`,
      '',
      '#ETF #DailyETFPulse #ETF투자',
    ].filter(Boolean);
    return lines.join('\n');
  }

  if (cat === 'surge') {
    const top = etfData?.byVolume?.[0];
    const lines = [
      `🚀 ${top?.name || 'ETF'} 급등 이유 분석`,
      '',
      top ? `거래량 ${(top.volume / 10000).toFixed(0)}만주 · ${top.changeRate >= 0 ? '+' : ''}${top.changeRate}%` : '',
      '섹터 모멘텀 + 개별 이슈 심층 분석',
      '',
      `→ ${url}`,
      '',
      '#급등ETF #ETF급등이유',
    ].filter(Boolean);
    return lines.join('\n');
  }

  if (cat === 'flow') {
    const topSector = etfData?.sectorFlow?.[0];
    const botSector = etfData?.sectorFlow?.[etfData.sectorFlow.length - 1];
    const lines = [
      '🌊 이번 주 자금 흐름',
      '',
      topSector ? `집중: ${topSector.sector} ${topSector.avgChangeRate >= 0 ? '+' : ''}${topSector.avgChangeRate}%` : '',
      botSector ? `이탈: ${botSector.sector} ${botSector.avgChangeRate}%` : '',
      '',
      '기관·외국인 수급 해석 →',
      url,
      '',
      '#섹터로테이션 #ETF자금흐름',
    ].filter(Boolean);
    return lines.join('\n');
  }

  if (cat === 'income') {
    const lines = [
      '💰 1천만 원 월배당 시뮬레이션',
      '',
      '연 10% 커버드콜 가정',
      '일반계좌 세후 70,500원 / 월',
      'ISA 비과세 83,333원 / 월',
      '',
      `세후 수익률 비교 → ${url}`,
      '',
      '#월배당ETF #커버드콜 #ISA',
    ].filter(Boolean);
    return lines.join('\n');
  }

  return `⚡ 새 글: ${published.slug}\n${url}`;
}

function buildOgUrl(published, title) {
  const siteUrl = (process.env.SITE_URL || '').replace(/\/+$/, '');
  if (!siteUrl) return null;
  const params = new URLSearchParams({
    title: title.slice(0, 60),
    category: published.category,
    date: new Date().toLocaleDateString('ko-KR'),
  });
  return `${siteUrl}/api/og?${params.toString()}`;
}

function pickTargetCategories() {
  const hour = new Date().getHours();
  const day = new Date().getDate();
  const afternoonPick = day % 2 === 0 ? 'flow' : 'income';

  // 오전 (0~14시): pulse 만. 오후(14시~): afternoonPick 만.
  // scheduler가 오전·오후 두 번 돌릴 경우 각각 1개씩 포스팅.
  if (hour < 14) return ['pulse'];
  return [afternoonPick];
}

async function run({ today, previousResults }) {
  logger.log(AGENT_NAME, '🧵 Threads 자동 포스팅');

  const published = previousResults?.HarnessDeployer?.published || [];
  if (published.length === 0) return { summary: '포스팅할 글 없음', results: [] };

  if (!process.env.THREADS_USER_ID || !process.env.THREADS_ACCESS_TOKEN) {
    logger.warn(AGENT_NAME, '⚠️ THREADS_USER_ID 또는 THREADS_ACCESS_TOKEN 미설정 — 포스팅 스킵 (샘플 모드)');
    return { summary: 'Threads 미설정 스킵', results: [] };
  }

  const targets = pickTargetCategories();
  const etfData = previousResults?.DataMiner?.etfData;
  const articleMap = new Map(
    (previousResults?.YmylGuard?.verifiedArticles || []).map(a => [a.slug, a])
  );

  const results = [];
  for (const cat of targets) {
    const item = published.find(p => p.category === cat);
    if (!item) continue;
    const article = articleMap.get(item.slug);
    const title = article?.title || `오늘의 ${cat}`;

    const text = buildText(item, etfData);
    const imageUrl = buildOgUrl(item, title);

    const result = await postThread({ text, imageUrl });
    if (result.ok) logger.success(AGENT_NAME, `  ✅ Threads 포스팅: ${cat} (${result.postId})`);
    else logger.warn(AGENT_NAME, `  ⚠️ Threads 실패: ${cat} — ${result.reason}`);
    results.push({ category: cat, ...result });
  }

  state.saveData(AGENT_NAME, 'processed', `threads_${today}_${new Date().getHours()}.json`, results);
  logger.success(AGENT_NAME, `Threads ${results.filter(r => r.ok).length}/${results.length} 성공`);

  return {
    summary: `Threads ${results.filter(r => r.ok).length}개 포스팅`,
    results,
  };
}

module.exports = { run };
