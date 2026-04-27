/**
 * 4️⃣ Visualizer (FlowVisualizer)
 *   - pulse : 거래량 TOP 랭킹 테이블 + 섹터 리더 바차트
 *   - surge : 단일 ETF 시세 카드 + 동일 섹터 비교 바차트
 *   - flow  : 섹터 자금흐름 SEO 테이블 (히트맵 용 데이터)
 *   - income: 월배당·세후 수익률 비교 테이블 + 시뮬레이션 라인차트
 *
 *   프론트엔드는 JSON만 읽어 차트/테이블을 렌더링.
 */

const state = require('../pipeline/state_manager');
const logger = require('../pipeline/logger');

const AGENT_NAME = 'Visualizer';

function makePulseCharts(article, etfData) {
  const top = (etfData.byVolume || []).slice(0, 10);
  const sectors = (etfData.sectorFlow || []).slice(0, 8);
  return [
    {
      type: 'table',
      title: '오늘의 거래량 TOP 10',
      columns: ['순위', '종목명', '코드', '현재가', '등락률', '거래량', '섹터'],
      rows: top.map((e, i) => [
        `${i + 1}`,
        e.name,
        e.code,
        `${e.price.toLocaleString()}원`,
        `${e.changeRate >= 0 ? '+' : ''}${e.changeRate}%`,
        `${(e.volume / 10000).toFixed(0)}만주`,
        e.sector,
      ]),
    },
    {
      type: 'bar',
      title: '섹터별 평균 등락률',
      data: sectors.map(s => ({
        label: s.sector,
        value: s.avgChangeRate,
        color: s.avgChangeRate >= 0 ? '#EF4444' : '#3B82F6',
      })),
    },
  ];
}

function makeSurgeCharts(article, etfData) {
  const focusCode = article.tickers?.[0];
  const focus = etfData.etfList?.find(e => e.code === focusCode) || etfData.byVolume?.[0];
  const sector = focus?.sector;
  const peers = (etfData.etfList || []).filter(e => e.sector === sector).slice(0, 6);

  return [
    {
      type: 'card',
      title: `${focus?.name} 시세 스냅샷`,
      items: [
        { label: '현재가', value: `${focus?.price.toLocaleString()}원` },
        { label: '전일대비', value: `${focus?.change >= 0 ? '+' : ''}${focus?.change}` },
        { label: '등락률', value: `${focus?.changeRate >= 0 ? '+' : ''}${focus?.changeRate}%` },
        { label: '거래량', value: `${(focus?.volume / 10000 || 0).toFixed(0)}만주` },
        { label: '거래대금', value: `${Math.round((focus?.tradeAmount || 0) / 1e8).toLocaleString()}억 원` },
        { label: '시가총액', value: `${Math.round((focus?.marketCap || 0) / 1e8).toLocaleString()}억 원` },
      ],
    },
    {
      type: 'bar',
      title: `${sector} 섹터 동일 테마 비교`,
      data: peers.map(e => ({
        label: e.name,
        value: e.changeRate,
        color: e.changeRate >= 0 ? '#EF4444' : '#3B82F6',
      })),
    },
  ];
}

function makeFlowCharts(article, etfData) {
  const sectors = etfData.sectorFlow || [];
  return [
    {
      type: 'table',
      title: '섹터별 주간 자금 흐름 (SEO 테이블)',
      columns: ['섹터', '평균 등락률', '거래대금(억원)', '종목수'],
      rows: sectors.map(s => [
        s.sector,
        `${s.avgChangeRate >= 0 ? '+' : ''}${s.avgChangeRate}%`,
        Math.round(s.totalAmount / 1e8).toLocaleString(),
        String(s.count),
      ]),
    },
    {
      type: 'heatmap',
      title: '섹터 로테이션 히트맵',
      data: sectors.map(s => ({
        sector: s.sector,
        value: s.avgChangeRate,
        weight: s.totalAmount,
      })),
    },
  ];
}

function makeIncomeCharts(article, etfData) {
  const simulations = [
    { principal: 10_000_000, monthly: 83_333, general: 70_500, isa: 83_333, pension: 78_750 },
    { principal: 30_000_000, monthly: 250_000, general: 211_500, isa: 250_000, pension: 236_250 },
    { principal: 50_000_000, monthly: 416_666, general: 352_500, isa: 416_666, pension: 393_750 },
    { principal: 100_000_000, monthly: 833_333, general: 705_000, isa: 833_333, pension: 787_500 },
  ];

  return [
    {
      type: 'table',
      title: '투자원금별 월 분배금 & 세후 수령액 (연 분배율 10% 가정)',
      columns: ['투자원금', '월분배금(세전)', '일반계좌(15.4%)', 'ISA 비과세', '연금저축·IRP(5.5%)'],
      rows: simulations.map(s => [
        `${(s.principal / 10000).toLocaleString()}만 원`,
        `${s.monthly.toLocaleString()}원`,
        `${s.general.toLocaleString()}원`,
        `${s.isa.toLocaleString()}원`,
        `${s.pension.toLocaleString()}원`,
      ]),
    },
    {
      type: 'comparison',
      title: '계좌 유형별 배당 세율',
      data: [
        { label: '일반 계좌', taxRate: 15.4, description: '배당소득세 15.4%' },
        { label: 'ISA (비과세)', taxRate: 0, description: '연 200만 원 비과세' },
        { label: '연금저축·IRP', taxRate: 4.4, description: '연금 수령 시 3.3~5.5%' },
      ],
    },
    {
      type: 'line',
      title: '월 50만 원 적립 + 재투자 10년 시뮬레이션',
      data: Array.from({ length: 10 }, (_, i) => {
        const year = i + 1;
        const principal = 50 * 12 * year;
        const conservative = Math.round(principal * (1 + 0.03 * year / 2));
        const moderate = Math.round(principal * (1 + 0.06 * year / 2));
        const aggressive = Math.round(principal * (1 + 0.09 * year / 2));
        return { label: `${year}년차`, conservative, moderate, aggressive };
      }),
      series: [
        { key: 'conservative', label: '안정형 (3%)', color: '#3B82F6' },
        { key: 'moderate', label: '중립형 (6%)', color: '#10B981' },
        { key: 'aggressive', label: '적극형 (9%)', color: '#F59E0B' },
      ],
    },
  ];
}

/** 차트별 SEO·접근성 ALT 텍스트 자동 생성 — Google 이미지 검색 + screen reader 동시 대응 */
function autoEnrichChartAlt(charts, article) {
  const ticker = article.tickers?.[0] || '';
  const date = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
  return charts.map(c => {
    if (c.alt) return c; // 이미 있으면 보존
    let alt = c.title || '데이터 시각화';
    // 카테고리·티커 컨텍스트 추가
    if (article.templateType === 'surge' && ticker) {
      alt = `${ticker} ${date} ${c.title || '시세 차트'} — Daily ETF Pulse`;
    } else if (article.templateType === 'pulse') {
      alt = `${date} ${c.title || 'KRX ETF 일별 시세'} — Daily ETF Pulse`;
    } else if (article.templateType === 'flow') {
      alt = `${c.title || '섹터별 자금 흐름'} — KRX 데이터 ${date}`;
    } else if (article.templateType === 'income') {
      alt = `${c.title || '월배당 ETF 분배금 비교'} — Daily ETF Pulse`;
    }
    return { ...c, alt };
  });
}

function generateChartData(article, etfData) {
  let charts;
  switch (article.templateType || article.category) {
    case 'pulse': charts = makePulseCharts(article, etfData); break;
    case 'surge': charts = makeSurgeCharts(article, etfData); break;
    case 'flow': charts = makeFlowCharts(article, etfData); break;
    case 'income': charts = makeIncomeCharts(article, etfData); break;
    default: charts = [];
  }
  return autoEnrichChartAlt(charts, article);
}

async function run({ today, previousResults }) {
  logger.log(AGENT_NAME, '📊 시각화 데이터 생성');

  const articles = previousResults?.LogicSpecialist?.articles || [];
  const etfData = previousResults?.DataMiner?.etfData || {};
  if (articles.length === 0) return { summary: '시각화 건너뜀', chartSets: [] };

  const chartSets = [];
  for (const article of articles) {
    const charts = generateChartData(article, etfData);
    chartSets.push({ articleSlug: article.slug, category: article.category, templateType: article.templateType, charts });
    state.saveData(AGENT_NAME, 'processed', `charts_${today}_${article.slug}.json`, charts);
    logger.log(AGENT_NAME, `  📈 [${article.templateType}] ${charts.length}개 차트/테이블`);
  }

  logger.success(AGENT_NAME, `총 ${chartSets.reduce((s, c) => s + c.charts.length, 0)}개 시각 자료 생성`);
  return {
    summary: `${chartSets.length}개 글에 대한 시각 데이터 생성`,
    chartSets,
  };
}

module.exports = { run };
