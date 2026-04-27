/**
 * 필러(클러스터) 가이드 페이지 정의.
 *   /guide/[slug] 라우트가 이 정의를 읽어 SEO 친화 콘텐츠 페이지를 생성.
 *
 *   각 가이드는:
 *     - 검색 의도가 명확한 키워드(예: "월배당 ETF 추천")의 답을 제공
 *     - 데이터(`dividend-registry`, `etf_portfolios`, `surge` 등)를 직접 끌어와 표·수치 포함
 *     - 데일리 글들이 본문 곳곳에서 자연스레 백링크되는 hub 역할
 *
 *   ⚠️ 시청자 가시 텍스트는 운영자 메타(글자수·자동발행·AI·크롤링 등) 노출 금지.
 */

export interface GuideFaq { question: string; answer: string }

export interface GuideSection {
  /** 섹션 제목 (h2) */
  heading: string;
  /** 본문 단락(들). HTML/MD 미사용, 순수 텍스트. */
  paragraphs: string[];
  /** 동적 데이터 블록 키 — 페이지에서 컴포넌트로 처리 */
  dataBlock?:
    | 'income-stability-table'   // 안정성 등급 표
    | 'income-monthly-calendar'  // 월별 캘린더
    | 'income-tax-compare'       // 계좌별 세후 비교
    | 'income-yield-ranking'     // 분배율 랭킹
    | 'covered-call-comparison'  // 커버드콜 ETF 비교
    | 'theme-etf-list:방산'      // 방산 ETF 목록 (현재 거래량/등락)
    | 'theme-etf-list:AI·데이터' // AI ETF 목록
    | 'theme-etf-list:반도체'
    | 'top-volume-snapshot'      // 거래량 1위 스냅샷
    | 'related-posts:income'     // 관련 글 리스트
    | 'related-posts:surge'
    | 'related-posts:flow'
    | 'related-posts:breaking'
    // 쿠팡 파트너스 상품 추천 (카테고리별, 책 + 학습 도구)
    | 'product-rec:income'
    | 'product-rec:covered-call'
    | 'product-rec:retirement'
    | 'product-rec:defense-etf'
    | 'product-rec:ai-semi-etf'
    | 'product-rec:general';

  /**
   * 단락 끝 자연 인용 (광고 슬롯 X — 단락 흐름의 일부).
   *   leadIn: "분배 일정을 본인 가계부와 매칭하려면" 같이 단락 마지막 한 줄
   *   productId: data/affiliates/products.json의 ProductEntry.id
   */
  affiliateInline?: {
    leadIn: string;
    productId: string;
    style?: 'mini-card' | 'text-link';
  };
}

export interface GuideDef {
  slug: string;
  /** 검색 결과 노출용 짧은 제목 */
  title: string;
  /** 한 줄 부제 */
  tagline: string;
  description: string;
  /** SEO keywords */
  keywords: string[];
  /** 카테고리 라벨 (sitemap·breadcrumb용) */
  section: '월배당 가이드' | '커버드콜 가이드' | '테마 ETF 가이드' | '은퇴 자산 가이드' | '배당주 가이드' | '환헤지 가이드' | '해외상장 가이드';
  /** 본문 섹션 */
  sections: GuideSection[];
  /** 페이지 끝 FAQ */
  faq: GuideFaq[];
  /** 마지막 업데이트 표시 (실제 데이터는 매일 새로고침) */
  lastReviewed: string;
  /**
   * HowTo 스키마를 발행할 가이드인지 여부.
   *   true이면 sections 중 본문 단락(paragraphs)이 있는 항목을 단계로 매핑해
   *   schema.org/HowTo 마크업을 함께 발행. "함께 보면 좋은 분석"·"책으로 더 깊이"
   *   같은 보조 섹션은 헤딩에 "함께"·"책으로"·"product-rec"·"related-posts" 포함 여부로 자동 제외.
   */
  howTo?: {
    /** 총 소요 시간 (ISO 8601 duration, 예: PT15M) */
    totalTime?: string;
    /** HowTo의 짧은 description (없으면 가이드의 description 재사용) */
    description?: string;
  };
  /**
   * Hero 직후 단일 mini-card.
   *   - 가이드 첫 화면(above the fold)에 1권 노출
   *   - 모바일·데스크톱 동일 노출 (sticky sidebar 회피)
   *   - 광고 톤 X — "함께 읽기" leadIn으로 큐레이션 톤 유지
   *   - productId가 가리키는 상품의 deeplink가 비어 있으면 production에서 자동 숨김
   */
  heroAffiliate?: {
    leadIn: string;
    productId: string;
  };
}

/** Pillar 1 — 월배당 ETF 완전 가이드 */
const monthlyDividend: GuideDef = {
  slug: 'monthly-dividend',
  title: '월배당 ETF 완전 가이드 — 매달 통장에 꽂히는 현금흐름 만들기',
  tagline: '월급 같은 ETF 분배금, 어떤 종목에 얼마를 넣어야 가능할까?',
  description:
    '국내에 상장된 주요 월배당 ETF의 분배 캘린더, 계좌별 세후 수익률, 안정성 등급, 목표 현금흐름 역산을 한 페이지에 정리한 가이드.',
  keywords: ['월배당 ETF', '월배당 ETF 추천', '월배당 ETF 종류', 'TIGER 월배당', 'KODEX 월배당', '커버드콜 월배당', '월 100만원 배당'],
  section: '월배당 가이드',
  lastReviewed: '2026-04-25',
  howTo: {
    totalTime: 'PT15M',
    description: '월배당 ETF의 분배 캘린더·계좌별 세후 수익률·목표 현금흐름 역산을 6단계로 따라가는 가이드.',
  },
  heroAffiliate: {
    leadIn: '이 가이드와 함께 읽기 좋은 책',
    productId: 'cpg-9353337355', // 나의 첫 월배당 ETF
  },
  sections: [
    {
      heading: '월배당 ETF란 — 분기·반기 배당과 무엇이 다른가',
      paragraphs: [
        '월배당 ETF는 분배금을 매월 지급하도록 설계된 상장지수펀드입니다. 일반적인 분기 배당(3·6·9·12월)이나 반기 배당과 달리, 매달 일정 금액을 통장으로 받기 때문에 은퇴 후 생활비·고정 지출과 매칭하기 쉽다는 장점이 있습니다.',
        '다만 매월 분배가 가능한 구조를 만들기 위해 대부분 커버드콜(Covered Call) 전략을 사용합니다. 이는 기초자산을 보유하면서 콜옵션을 매도해 옵션 프리미엄을 분배 재원으로 쓰는 방식입니다. 그 결과 강세장에서는 시세 차익이 제한되고, 약세장에서는 옵션 프리미엄으로 일부 손실을 완충하는 특성이 나타납니다.',
        '본 가이드는 국내 운용사가 상장한 주요 월배당 ETF를 안정성·세후 수익률·지급 월·기초자산 관점에서 비교합니다.',
      ],
    },
    {
      heading: '안정성 등급으로 본 월배당 ETF — S 등급부터',
      paragraphs: [
        '같은 월배당이라도 분배가 안정적인 종목과 변동이 큰 종목이 분명히 구분됩니다. 본 사이트는 과거 12개월 분배 변동성과 기초자산 변동성을 종합해 S(매우 안정)·A(안정)·B(보통)·C(변동 큼) 4단계로 분류합니다.',
        '아래 표는 등록된 종목을 안정성 → 분배율 순으로 정렬한 결과입니다.',
      ],
      dataBlock: 'income-stability-table',
      affiliateInline: {
        leadIn: '월배당 ETF의 분배 구조를 사례 중심으로 더 깊이 보고 싶다면',
        productId: 'cpg-9353337355', // 나의 첫 월배당 ETF
        style: 'mini-card',
      },
    },
    {
      heading: '분배 캘린더 — 어느 달에 어떤 ETF가 분배하나',
      paragraphs: [
        '월배당이라 해도 모든 ETF가 같은 날짜에 분배하지는 않습니다. 종목을 2~3개 조합하면 매달 다른 시점에 분배금이 들어와 캐시플로가 더 매끄러워집니다.',
        '아래 캘린더는 월별로 등록된 ETF의 분배 시점을 보여줍니다.',
      ],
      dataBlock: 'income-monthly-calendar',
      affiliateInline: {
        leadIn: '월 단위로 따박따박 들어오는 분배금 설계를 책 한 권으로 정리하고 싶다면',
        productId: 'cpg-9438194901', // 평생 월 500만 원 받는 월배당 ETF
        style: 'mini-card',
      },
    },
    {
      heading: '계좌별 세후 수익률 — ISA·연금저축·일반계좌',
      paragraphs: [
        '같은 분배금이라도 어느 계좌에서 받느냐에 따라 실제 수령액이 달라집니다.',
        '일반 계좌는 배당소득세 15.4%가 원천 징수되고, ISA는 200만원까지 비과세(손익통산), 연금저축·IRP는 과세이연 후 인출 시 5.5~16.5% 저율과세가 적용됩니다.',
        '아래 도구로 같은 종목·금액 기준 계좌별 세후 수익률을 즉시 비교할 수 있습니다.',
      ],
      dataBlock: 'income-tax-compare',
    },
    {
      heading: '월 OO만원을 받으려면 얼마가 필요할까',
      paragraphs: [
        '실제 은퇴 설계에서 가장 자주 받는 질문은 "월 100만원 받으려면 원금이 얼마 필요한가"입니다.',
        '연 분배율과 계좌 유형에 따라 필요 원금이 크게 달라지므로, 본 사이트의 목표 현금흐름 계산기로 본인의 상황에 맞춰 역산해 보세요.',
      ],
      dataBlock: 'income-yield-ranking',
    },
    {
      heading: '월배당 ETF의 리스크 — 알아두어야 할 것',
      paragraphs: [
        '커버드콜 기반 월배당 ETF는 강세장에서 시세 차익이 제한되고, 약세장에서 옵션 프리미엄이 일부 손실을 완충하지만 원금 보장은 아닙니다. 분배율도 시장 변동성에 따라 변동합니다.',
        '특히 높은 분배율(연 10% 초과)은 기초자산의 가격 하락을 분배로 환원하는 구조일 수 있으므로, 분배율만 보지 말고 NAV·기초자산 추이를 함께 확인해야 합니다.',
        '안정성 등급 S·A 종목을 코어로 두고, B·C 종목은 포트폴리오의 일부로만 활용하는 것이 일반적입니다.',
      ],
    },
    {
      heading: '함께 보면 좋은 데일리 분석',
      paragraphs: [
        '아래는 월배당·커버드콜 카테고리에서 가장 최근 발행된 분석들입니다.',
      ],
      dataBlock: 'related-posts:income',
    },
    {
      heading: '책으로 더 깊이 보고 싶다면',
      paragraphs: [
        '본 사이트가 매일 보여주는 데이터와 짝지어 두면 좋은 책 큐레이션입니다. 쿠팡 파트너스를 통해 구매 시 일정 수수료를 받습니다.',
      ],
      dataBlock: 'product-rec:income',
    },
  ],
  faq: [
    {
      question: '월배당 ETF는 매월 며칠에 분배되나요?',
      answer: '종목마다 다릅니다. 보통 월 1회, 결제일은 운용사·종목에 따라 5~25일 사이입니다. 본 가이드의 분배 캘린더에서 월별 지급 ETF를 확인할 수 있습니다.',
    },
    {
      question: '분배율이 높을수록 좋은 ETF인가요?',
      answer: '아닙니다. 분배율은 NAV(순자산가치) 대비 분배 비율이라, 기초자산이 하락하면 분배율은 일시적으로 높아질 수 있습니다. 분배율과 함께 기초자산 추이·안정성 등급을 봐야 합니다.',
    },
    {
      question: '월배당 ETF만으로 은퇴 자산을 운용해도 되나요?',
      answer: '월배당만으로 100% 운용하면 강세장 수익을 놓칠 수 있습니다. 일반적으로 코어(저변동·인덱스 ETF)와 위성(월배당·테마)을 조합한 바벨 전략을 권합니다.',
    },
  ],
};

/** Pillar 2 — 커버드콜 ETF 비교 가이드 */
const coveredCall: GuideDef = {
  slug: 'covered-call',
  title: '커버드콜 ETF 비교 — TIGER·KODEX·SOL·ACE 어떤 것이 나을까',
  tagline: '국내 상장 커버드콜 ETF의 구조·분배·안정성 한눈 비교',
  description:
    'TIGER·KODEX·SOL·ACE 등 국내 운용사가 상장한 주요 커버드콜 ETF의 기초자산·옵션 매도 비율·분배율·안정성을 한 페이지에 비교한 가이드.',
  keywords: ['커버드콜 ETF', '커버드콜 ETF 비교', 'TIGER 커버드콜', 'KODEX 커버드콜', 'JEPI 한국판', '나스닥100 커버드콜', '미국S&P500 커버드콜'],
  section: '커버드콜 가이드',
  lastReviewed: '2026-04-25',
  heroAffiliate: {
    leadIn: '커버드콜 전략 심화 학습에 적합한 책',
    productId: 'cpg-18789221', // 쉽고 편안하게 고수익 내는 퀀트&커버드 콜 전략
  },
  sections: [
    {
      heading: '커버드콜 전략이 ETF에 적용되면 어떻게 동작하나',
      paragraphs: [
        '커버드콜은 기초자산(주식)을 보유하면서 동시에 그 주식을 일정 가격에 살 권리(콜옵션)를 팔아 옵션 프리미엄을 받는 전략입니다.',
        'ETF로 구현되면 기초자산의 일부 또는 전부에 대해 옵션을 매도하고, 그 프리미엄을 분배금 재원으로 사용합니다. 옵션 매도 비율(예: 100% 커버 vs 50% 커버)에 따라 분배율과 시세 차익 참여 비율이 달라집니다.',
      ],
    },
    {
      heading: '국내 상장 주요 커버드콜 ETF 한눈 비교',
      paragraphs: [
        '국내 운용사들이 상장한 커버드콜 ETF는 기초자산(미국 S&P500/나스닥100/국내 주식 등)과 커버 비율에 따라 성격이 크게 달라집니다.',
        '아래 표는 등록된 커버드콜 ETF를 안정성·분배율·기초자산 순으로 비교한 결과입니다.',
      ],
      dataBlock: 'covered-call-comparison',
    },
    {
      heading: 'JEPI·QYLD 같은 미국 커버드콜 ETF의 한국판은?',
      paragraphs: [
        '미국에 상장된 JEPI(JPMorgan Equity Premium Income), QYLD(Global X Nasdaq 100 Covered Call) 등은 한국 투자자에게도 친숙합니다.',
        '국내에는 동일한 기초자산을 추종하면서 환헤지·환노출·세제 측면에서 한국 투자자에게 더 유리한 구조의 ETF들이 상장되어 있습니다. 본 가이드의 비교 표에서 기초자산을 기준으로 매칭해 보세요.',
      ],
    },
    {
      heading: '커버드콜 ETF의 함정 — 강세장에서의 기회비용',
      paragraphs: [
        '커버드콜은 강세장에서 콜옵션이 행사되어 기초자산을 매도해야 하므로, 시세 차익이 옵션 행사가 수준에서 제한됩니다.',
        '즉 코스피·나스닥이 빠르게 오르는 구간에서는 일반 인덱스 ETF 대비 수익률이 뒤처질 수 있습니다. 대신 옆으로 횡보하는 시장이나 약세장에서는 옵션 프리미엄이 손실을 완충합니다.',
        '커버드콜 ETF는 "월 분배"라는 특성을 위해 "강세장 수익"을 일부 포기하는 트레이드오프임을 이해하고 매수해야 합니다.',
      ],
    },
    {
      heading: '함께 보면 좋은 데일리 분석',
      paragraphs: ['아래는 커버드콜·월배당 카테고리에서 최근 발행된 분석입니다.'],
      dataBlock: 'related-posts:income',
    },
  ],
  faq: [
    {
      question: '커버드콜 ETF는 매도해도 손실인가요?',
      answer: '매수가 대비 NAV가 낮아진 시점에 매도하면 손실입니다. 분배금을 누적해 받은 금액과 시세 차익(또는 손실)을 합쳐서 평가해야 합니다.',
    },
    {
      question: '연 분배율이 12%인 커버드콜 ETF, 안전한가요?',
      answer: '높은 분배율은 옵션 프리미엄이 풍부한 변동성 큰 시장 환경을 반영합니다. 변동성이 가라앉으면 분배율도 낮아질 수 있습니다.',
    },
  ],
};

/** Pillar 3 — 방산 ETF 비교 (테마) */
const defenseEtf: GuideDef = {
  slug: 'defense-etf',
  title: '방산 ETF 비교 가이드 — 한화에어로·LIG넥스원·KAI 누구를 더 담나',
  tagline: '국내 상장 방산 ETF 4종의 구성종목·비중·최근 흐름 한눈 비교',
  description:
    'TIGER·KODEX·SOL 등 국내 운용사 방위산업 ETF의 구성종목 TOP·섹터 비중·최근 거래량 흐름을 정리한 비교 가이드.',
  keywords: ['방산 ETF', '방위산업 ETF', '한화에어로 ETF', 'LIG넥스원 ETF', 'KAI ETF', 'TIGER 방산', 'KODEX 방산', 'SOL 방산'],
  section: '테마 ETF 가이드',
  lastReviewed: '2026-04-25',
  sections: [
    {
      heading: '왜 지금 방산 ETF인가',
      paragraphs: [
        '한국 방위산업은 K9 자주포·천궁·KF-21·잠수함 등 수출 호조와 글로벌 안보 이슈가 맞물리면서 중장기 성장 테마로 자리잡았습니다.',
        '개별 기업(한화에어로스페이스·LIG넥스원·한국항공우주·현대로템 등)에 직접 투자하는 대신, ETF로 분산하면 기업별 리스크를 완화하면서 섹터 전체의 흐름을 따라갈 수 있습니다.',
      ],
    },
    {
      heading: '국내 방산 ETF 구성종목 비교',
      paragraphs: [
        '방산 ETF들은 같은 섹터를 다루지만 운용사별로 종목 비중이 다릅니다. 예를 들어 어떤 ETF는 한화에어로 비중이 30%를 넘는 반면, 다른 ETF는 LIG넥스원·KAI 비중을 더 높게 잡기도 합니다.',
        '아래 목록은 등록된 방산 ETF들의 오늘 거래량과 등락률을 함께 보여줍니다.',
      ],
      dataBlock: 'theme-etf-list:방산',
    },
    {
      heading: '방산 ETF의 리스크 — 정책·수출 의존도',
      paragraphs: [
        '방산 섹터는 정부 국방예산·수출 계약·국제 정치 변수에 민감합니다. 단기적으로는 수출 계약 발표 시 급등하지만, 계약 지연이나 취소 뉴스에 민감하게 하락하는 변동성이 있습니다.',
        '코어 자산이 아니라 위성(satellite) 포지션으로 5~15% 비중에서 운용하는 것이 일반적인 권고입니다.',
      ],
    },
    {
      heading: '함께 보면 좋은 데일리 분석',
      paragraphs: ['방산·국내주식 카테고리의 최근 분석입니다.'],
      dataBlock: 'related-posts:surge',
    },
  ],
  faq: [
    {
      question: '방산 ETF는 어떤 계좌에 담는 게 유리한가요?',
      answer: '국내 주식형 ETF이므로 매매 차익은 비과세입니다. 분배금이 있는 종목이라면 ISA·연금저축에서 매수하면 세후 효율이 더 좋습니다.',
    },
    {
      question: '한화에어로·LIG넥스원 직접 매수와 ETF 중 무엇이 낫나요?',
      answer: '직접 매수는 한 종목에 집중되어 변동성이 크고, ETF는 5~10개 종목으로 분산되어 변동성이 낮습니다. 본인의 위험 감수 성향에 따라 선택하세요.',
    },
  ],
};

/** Pillar 4 — AI·반도체 ETF */
const aiSemiEtf: GuideDef = {
  slug: 'ai-semi-etf',
  title: 'AI·반도체 ETF 가이드 — 엔비디아·HBM·데이터센터 노출 ETF 비교',
  tagline: 'AI 호황 사이클에서 한국 투자자가 접근할 수 있는 ETF 선택지',
  description:
    'AI·HBM·데이터센터 테마에 노출된 국내 상장 ETF의 구성종목·비중·최근 흐름을 한 페이지에 정리한 가이드.',
  keywords: ['AI ETF', 'AI 반도체 ETF', 'HBM ETF', '엔비디아 ETF', 'TIGER 반도체', 'KODEX 반도체', '데이터센터 ETF', 'AI 인프라 ETF'],
  section: '테마 ETF 가이드',
  lastReviewed: '2026-04-25',
  sections: [
    {
      heading: 'AI 사이클에서 ETF로 노출하는 3가지 방법',
      paragraphs: [
        '첫째, 미국 빅테크 직접 노출 ETF — 엔비디아·MS·메타·구글 등 AI 인프라 핵심 기업을 담은 ETF.',
        '둘째, 한국 반도체 노출 ETF — 삼성전자·SK하이닉스 비중이 높은 ETF로, HBM·메모리 사이클의 한국 수혜 부분을 추적.',
        '셋째, AI 응용·소프트웨어 ETF — 클라우드·SaaS·자율주행 등 AI 응용 단계 기업을 담은 ETF.',
      ],
    },
    {
      heading: '국내 상장 AI·반도체 ETF 비교',
      paragraphs: [
        '아래 목록은 등록된 AI·데이터·반도체 테마 ETF들의 오늘 거래량과 등락률입니다.',
      ],
      dataBlock: 'theme-etf-list:AI·데이터',
    },
    {
      heading: '한국 반도체 ETF',
      paragraphs: [
        'HBM·메모리 사이클의 직접 수혜를 받는 한국 반도체 노출 ETF입니다.',
      ],
      dataBlock: 'theme-etf-list:반도체',
    },
    {
      heading: 'AI ETF의 리스크 — 사이클·집중도·환율',
      paragraphs: [
        'AI·반도체 ETF는 사이클성이 강합니다. 호황기엔 수익률이 가파르지만 사이클 전환 시점에서는 변동성이 큽니다.',
        '미국 빅테크 노출 ETF는 환율 변동(원/달러)이 수익률에 직접 반영되므로, 환헤지 여부를 반드시 확인해야 합니다.',
        '집중도가 높은 ETF(엔비디아 비중 20%+)는 단일 종목 이슈에 큰 폭으로 흔들릴 수 있습니다.',
      ],
    },
    {
      heading: '함께 보면 좋은 데일리 분석',
      paragraphs: ['AI·반도체 테마의 최근 분석입니다.'],
      dataBlock: 'related-posts:surge',
    },
  ],
  faq: [
    {
      question: '미국 AI ETF와 한국 AI ETF 중 어디부터 시작해야 하나요?',
      answer: '환율 리스크를 신경 쓰지 않는다면 미국 직접 노출이 단순합니다. 환율과 세제 효율을 우선한다면 한국 상장 ETF에서 환헤지 버전을 고려하세요.',
    },
    {
      question: '엔비디아 비중이 높은 ETF, 안전한가요?',
      answer: '단일 종목 비중이 20%를 넘으면 사실상 그 기업의 직접 영향을 크게 받습니다. 분산 효과가 떨어지므로 본인의 신뢰 수준에 따라 결정하세요.',
    },
  ],
};

/** Pillar 5 — 은퇴 자산 설계 (IRP+ISA+연금저축 조합) */
const retirement: GuideDef = {
  slug: 'retirement',
  title: '은퇴 자산 설계 — IRP·ISA·연금저축 조합으로 월 현금흐름 만들기',
  tagline: '4050이 비과세·과세이연 계좌를 어떻게 조합해야 가장 효율적인가',
  description:
    'IRP·ISA·연금저축의 세제 혜택을 비교하고, 월배당 ETF를 어디에 담아야 가장 효율적인지 정리한 은퇴 자산 설계 가이드.',
  keywords: ['IRP ETF', 'ISA 비과세 ETF', '연금저축 ETF', '은퇴 자산 ETF', '4050 은퇴 설계', '연금 ETF 추천', 'ISA 연금저축 차이'],
  section: '은퇴 자산 가이드',
  lastReviewed: '2026-04-25',
  howTo: {
    totalTime: 'PT20M',
    description: 'IRP·ISA·연금저축의 한도와 세제 차이를 비교하고, 월배당·인덱스 ETF를 어떤 계좌에 담아야 가장 효율적인지 단계별로 정리한 가이드.',
  },
  heroAffiliate: {
    leadIn: '은퇴 자산 설계를 한 권으로 정리하고 싶다면',
    productId: 'cpg-9097642998', // 박곰희 연금 부자 수업
  },
  sections: [
    {
      heading: '은퇴 자산은 왜 "계좌부터" 정해야 하나',
      paragraphs: [
        '같은 ETF라도 어느 계좌에서 매수하느냐에 따라 세후 수익률이 달라집니다. 일반 계좌에서 받는 분배금은 15.4% 세금이 빠지지만, ISA에서는 200만원까지 비과세입니다.',
        '연금저축·IRP는 매수 시점에 세액공제를 받고 인출 시 5.5~16.5%로 저율과세되어, 장기 누적 효과가 큽니다.',
        '따라서 월배당 ETF는 ISA·연금저축에 우선 담고, 인덱스 코어 자산은 일반 계좌에 두는 식으로 계좌별 분산이 권장됩니다.',
      ],
    },
    {
      heading: '계좌별 세후 수익률 — 직접 비교',
      paragraphs: [
        '같은 종목·같은 분배율 기준으로 계좌별 세후 수익률을 비교해 보세요.',
      ],
      dataBlock: 'income-tax-compare',
    },
    {
      heading: 'IRP·ISA·연금저축 — 한도와 차이',
      paragraphs: [
        'IRP(개인형 퇴직연금): 연 1,800만원 납입 한도, 최대 900만원까지 세액공제(연금저축 합산). 55세 이후 연금 수령 시 저율과세.',
        'ISA(개인종합자산관리계좌): 연 2,000만원 납입, 5년 의무 보유, 200만원(서민형 400만원)까지 비과세 후 9.9% 분리과세.',
        '연금저축펀드: 연 600만원까지 세액공제(IRP 합산 900만원). 가입 후 5년 경과 + 55세 이후부터 인출 가능.',
      ],
      affiliateInline: {
        leadIn: '계좌별 한도·세제 활용을 사례로 정리한 가이드를 보고 싶다면',
        productId: 'cpg-9097642998', // 박곰희 연금 부자 수업
        style: 'mini-card',
      },
    },
    {
      heading: '코어 + 위성 — 은퇴 자산 포트폴리오 예시',
      paragraphs: [
        '코어 자산(60~70%): 인덱스(KOSPI200·미국S&P500·전세계) ETF + 채권 ETF — 일반 계좌 또는 IRP의 안전자산 비중.',
        '위성 자산(20~30%): 월배당·커버드콜 ETF — ISA·연금저축에 우선 배치해 분배 세금 효과 극대화.',
        '테마(5~10%): 방산·AI·반도체·바이오 등 기회 포착용 — 일반 계좌에서 자유롭게 매매.',
      ],
      affiliateInline: {
        leadIn: '월배당 ETF 코어-위성 전략을 실전 사례로 풀어낸 책으로 더 깊이 보려면',
        productId: 'cpg-8534086995', // 나는 미국 월배당 ETF로 40대에 은퇴한다 + 마법의 연금 굴리기 (전2권)
        style: 'mini-card',
      },
    },
    {
      heading: '오늘 시점에서 추천 가능한 안정성 S 등급 종목',
      paragraphs: ['은퇴 코어 자산 또는 ISA·연금저축의 안정 코어로 활용 가능한 종목입니다.'],
      dataBlock: 'income-stability-table',
    },
    {
      heading: '함께 보면 좋은 데일리 분석',
      paragraphs: ['월배당·계좌 카테고리의 최근 분석입니다.'],
      dataBlock: 'related-posts:income',
    },
    {
      heading: '책으로 더 깊이 보고 싶다면',
      paragraphs: [
        '은퇴 자산 설계와 IRP·ISA·연금저축 활용을 한 권에 정리한 책입니다. 쿠팡 파트너스를 통해 구매 시 일정 수수료를 받습니다.',
      ],
      dataBlock: 'product-rec:retirement',
    },
  ],
  faq: [
    {
      question: '40대인데 연금저축·IRP·ISA를 모두 만들어야 할까요?',
      answer: '세액공제는 IRP+연금저축 합산 900만원, 별도로 ISA는 분배금·매매차익 비과세까지 가져갑니다. 자금 여유가 된다면 셋 다 활용하는 것이 가장 효율적입니다.',
    },
    {
      question: '월배당 ETF를 일반 계좌에 담으면 손해인가요?',
      answer: '손해는 아니지만, 분배금에 15.4% 세금이 그대로 부과됩니다. ISA에서 받으면 200만원까지 비과세, 연금저축이라면 인출 전까지 과세이연이 됩니다.',
    },
    {
      question: 'IRP에 ETF만 담아도 되나요?',
      answer: '됩니다. 다만 IRP는 위험자산 비중이 70% 이내로 제한되므로, 채권형 ETF나 안전자산을 30% 이상 함께 보유해야 합니다.',
    },
  ],
};

/** Pillar 6 — 배당주 ETF 가이드 */
const usDividend: GuideDef = {
  slug: 'us-dividend',
  title: '미국 배당주 ETF 가이드 — SCHD 한국판부터 KODEX 미국배당까지',
  tagline: 'Dow Jones US Dividend 100·배당귀족·고배당 — 어떤 ETF를 골라야 할까',
  description:
    '미국 배당주 ETF의 기초자산(SCHD·NOBL·VYM 등 추종 지수), KODEX·ACE·TIGER 운용사별 차이, 환헷지 여부, 분배 캘린더, ISA·연금저축 매수 가이드를 정리한 가이드.',
  keywords: ['미국 배당주 ETF', '배당주 ETF 추천', 'SCHD 한국판', 'KODEX 미국배당다우존스', 'ACE 미국배당다우존스', '미국 배당귀족 ETF', '환헤지 배당 ETF'],
  section: '배당주 가이드',
  lastReviewed: '2026-04-27',
  howTo: {
    totalTime: 'PT15M',
    description: '미국 배당주 ETF의 기초자산·운용사·환헷지·계좌별 세후 수익률을 4단계로 따라가는 가이드.',
  },
  sections: [
    {
      heading: '미국 배당주 ETF란 — 왜 한국 ETF로 미국 배당을 받나',
      paragraphs: [
        '미국 배당주 ETF는 미국 상장 고배당 종목(예: Home Depot·Texas Instruments·Coca-Cola)을 모아 분기·반기 분배하는 펀드입니다. 한국에 상장된 미국 배당 ETF를 매수하면 환전 없이 원화로 거래·분배받을 수 있어, ISA·연금저축 같은 절세 계좌 활용이 쉬워집니다.',
        '대표 추종 지수는 Dow Jones US Dividend 100(SCHD가 추종)으로, 10년 이상 배당 지속·재무 건전성 기준을 통과한 100개 우량주를 포함합니다. 한국에서는 KODEX·ACE·TIGER가 같은 지수를 각각 추종합니다.',
        '월배당 ETF(커버드콜)와 달리 시세 차익도 함께 기대할 수 있는 점이 차별화 요소입니다.',
      ],
    },
    {
      heading: 'KODEX vs ACE vs TIGER — 같은 지수, 다른 운용사 비교',
      paragraphs: [
        '같은 Dow Jones US Dividend 100 지수를 추종하는 ETF여도 운용사별 총보수·환헷지 옵션·분배 정책이 다릅니다.',
        '아래 표는 등록된 미국 배당주 ETF의 핵심 특성을 비교합니다.',
      ],
      dataBlock: 'income-yield-ranking',
    },
    {
      heading: '환헷지(H) 종목 vs 비헷지 — 어떤 게 유리할까',
      paragraphs: [
        '환헷지(H) ETF는 환율 변동을 차단해 분배금·시세 모두 원화 기준으로 안정적입니다. 비헷지 ETF는 원/달러 환율 상승 시 추가 수익, 하락 시 손실이 발생합니다.',
        '4050 은퇴 자산·고정 캐시플로 목적이라면 환헷지(H) 우선, 달러 자산 분산이 목적이라면 비헷지가 적합합니다.',
        '본 사이트는 두 옵션 모두 등록된 종목의 분배율과 NAV 추이를 함께 추적합니다.',
      ],
    },
    {
      heading: '계좌별 세후 수익률 — ISA·연금저축에서 받으면',
      paragraphs: [
        '미국 배당주 ETF의 분배금은 일반계좌에서 15.4% 배당소득세가 즉시 차감됩니다. ISA에서는 200만원까지 비과세, 연금저축·IRP에서는 인출 시점까지 과세이연됩니다.',
        '같은 100만원 분배 기준 계좌별 세후 수령액을 직접 비교해 보세요.',
      ],
      dataBlock: 'income-tax-compare',
    },
    {
      heading: '미국 배당주 ETF의 리스크 — 알아두어야 할 것',
      paragraphs: [
        '미국 금리 인하 사이클에서는 고배당 가치주가 우호적이지만, 강한 강세장에서는 성장주 대비 시세 차익이 제한됩니다.',
        '환헷지 ETF는 헷지 비용(연 1~2%)이 분배율을 일부 상쇄합니다. 비헷지 ETF는 환율 변동성에 직접 노출됩니다.',
        '특정 섹터(금융·필수소비재) 비중이 높아 섹터 사이클 리스크가 있습니다.',
      ],
    },
    {
      heading: '함께 보면 좋은 데일리 분석',
      paragraphs: ['월배당·계좌 카테고리의 최근 분석입니다.'],
      dataBlock: 'related-posts:income',
    },
    {
      heading: '책으로 더 깊이 보고 싶다면',
      paragraphs: [
        '미국 배당 투자 전략을 한 권으로 정리한 책 큐레이션입니다. 쿠팡 파트너스를 통해 구매 시 일정 수수료를 받습니다.',
      ],
      dataBlock: 'product-rec:income',
    },
  ],
  faq: [
    {
      question: 'KODEX 미국배당다우존스와 ACE 미국배당다우존스 중 무엇을 살까요?',
      answer: '기초 지수가 같으므로 총보수가 낮은 종목을 선호하는 게 일반적입니다. ACE가 KODEX 시리즈 대비 총보수가 다소 낮은 편이지만, 거래량·순자산이 큰 KODEX가 매매 편의성이 높습니다.',
    },
    {
      question: '미국 배당주 ETF는 매월 분배되나요?',
      answer: '대부분 분기 분배(3·6·9·12월)입니다. 월배당이 필요하다면 같은 SCHD 기초자산에 커버드콜 전략을 더한 월배당 ETF(예: KODEX 미국배당다우존스데일리커버드콜OTM)를 검토하세요.',
    },
    {
      question: '환헷지(H)와 비헷지 중 무엇이 좋을까요?',
      answer: '본인 환 시각에 따라 선택합니다. 원화 약세를 예상한다면 비헷지로 환차익까지 노릴 수 있고, 환율 노출이 부담스럽다면 환헷지(H)가 안정적입니다.',
    },
  ],
};

/** Pillar 7 — 환헤지 ETF 가이드 */
const currencyHedge: GuideDef = {
  slug: 'currency-hedge',
  title: '환헤지(H) ETF 가이드 — 같은 미국 ETF 어떤 옵션을 골라야 하나',
  tagline: '환헤지·비헤지·합성형, 한국 상장 미국 ETF의 환율 영향 한 페이지',
  description:
    '한국 상장 해외 ETF의 환헤지(H) 표기·헤지 비용·NAV 변동 차이·시기별 적합 옵션을 정리한 가이드. KODEX·TIGER·ACE의 헤지/비헤지 페어 비교.',
  keywords: ['환헤지 ETF', '환헷지 H 차이', '미국 ETF 환헤지', '환율 ETF', 'KODEX 환헤지', 'TIGER 환헤지', '환헤지 비용'],
  section: '환헤지 가이드',
  lastReviewed: '2026-04-27',
  howTo: {
    totalTime: 'PT12M',
    description: '환헤지(H) vs 비헷지 ETF의 NAV·분배·환율 영향을 4단계로 비교하는 가이드.',
  },
  sections: [
    {
      heading: '환헤지(H)란 — 종목명 뒤 H가 붙는 이유',
      paragraphs: [
        '한국에 상장된 해외 ETF 종목명 뒤에 (H)가 붙으면 환헤지 종목입니다. 예: KODEX 미국S&P500(H), TIGER 미국나스닥100TR(H). 운용사가 통화선도·스왑 등으로 원/달러 환율 변동을 차단해, 기초자산(미국 주가지수)의 변동만 NAV에 반영하는 구조입니다.',
        '비헤지 ETF는 같은 기초자산이라도 환율 변동이 NAV에 직접 반영됩니다. 원/달러 환율이 상승하면 추가 수익, 하락하면 추가 손실이 발생합니다.',
        '같은 운용사가 헤지/비헷지 페어를 동시에 상장하는 경우가 많아, 본인의 환 시각에 따라 선택할 수 있습니다.',
      ],
    },
    {
      heading: '환헤지 비용 — 분배율을 갉아먹는 숨은 요소',
      paragraphs: [
        '환헤지에는 비용이 듭니다. 통화선도·스왑 거래 수수료 + 한미 금리차에서 발생하는 헤지 코스트가 연 0.5~2.5% 수준입니다.',
        '한미 금리차가 클 때(예: 미국 5.25% vs 한국 3.50%) 헤지 비용이 커지고, 비슷할 때(둘 다 3% 근처) 헤지 비용이 작아집니다.',
        '환헤지 ETF의 NAV는 비헤지 대비 헤지 코스트만큼 매년 갉아먹히므로, 장기 보유 시 환차익 기회와 헤지 안정성을 trade-off해야 합니다.',
      ],
    },
    {
      heading: '환헤지 vs 비헤지 — 시기별 적합 옵션',
      paragraphs: [
        '원화 약세 사이클(원/달러 상승)에서는 비헤지가 환차익까지 가져갑니다. 2022~2024년처럼 원/달러가 1100→1450원으로 오를 때 비헤지가 헤지 대비 30%+ 추가 수익.',
        '원화 강세 사이클(원/달러 하락)에서는 환헤지가 안정적입니다. 환율 하락분이 NAV에서 차감되지 않습니다.',
        '예측이 어렵다면 헤지/비헷지 50:50 분산이 일반적인 권장입니다. ISA·연금저축에는 환헤지 우선, 일반 계좌에는 비헷지로 분리하는 전략도 있습니다.',
      ],
    },
    {
      heading: '한국 상장 환헤지 ETF — 대표 종목 비교',
      paragraphs: [
        '같은 미국 S&P500·나스닥100을 추종하는 환헤지 ETF가 운용사별로 여러 종목 상장돼 있습니다.',
        '아래는 등록된 종목들의 총보수·NAV 추이·분배 정책을 비교한 표입니다.',
      ],
      dataBlock: 'top-volume-snapshot',
    },
    {
      heading: '환헤지 ETF의 리스크 — 알아두어야 할 것',
      paragraphs: [
        '헤지 비용이 매년 누적됩니다. 5년 보유 시 누적 헤지 비용이 분배율 1년치를 넘을 수 있습니다.',
        '한미 금리차 변동에 따라 헤지 비용이 매년 다릅니다. 운용사 공시의 "헤지 코스트" 항목을 확인하세요.',
        '극단적 환율 변동(예: 환율 1500원 돌파)에서는 헤지 거래 자체의 만기 도래·롤오버 비용이 추가될 수 있습니다.',
      ],
    },
    {
      heading: '함께 보면 좋은 데일리 분석',
      paragraphs: ['해외주식 카테고리의 최근 분석입니다.'],
      dataBlock: 'related-posts:flow',
    },
  ],
  faq: [
    {
      question: '환헤지(H) ETF는 환차익을 못 가져가나요?',
      answer: '맞습니다. 환율 변동이 NAV에서 차단되므로 원화 약세 시 추가 수익을 못 얻지만, 강세 시 손실도 막아줍니다.',
    },
    {
      question: '환헤지 비용은 어디서 확인하나요?',
      answer: '운용사 공식 PDP(상품 안내) 페이지의 "헤지 비용" 또는 분기 NAV 보고서에 명시됩니다. 보통 연 0.5~2.5%입니다.',
    },
    {
      question: 'ISA에는 환헤지·비헷지 중 무엇이 좋을까요?',
      answer: 'ISA는 비과세 한도(200만원)가 있어 분배·매매차익 모두 절세됩니다. 환차익을 노린다면 비헷지, 안정적 분배가 목적이라면 환헤지(H)가 일반적인 권장입니다.',
    },
  ],
};

/** Pillar 8 — 해외상장 ETF 가이드 */
const overseasEtf: GuideDef = {
  slug: 'overseas-etf',
  title: '해외상장 ETF 직구 가이드 — SPY·QQQ·SCHD 한국 vs 직구 비교',
  tagline: '한국 상장 미국 ETF vs 미국 직접 상장 ETF, 어떤 게 유리할까',
  description:
    'SPY·QQQ·SCHD·VOO 같은 미국 상장 ETF를 한국 증권사로 직접 매수할 때 vs 한국 상장 미국 ETF(KODEX·TIGER 시리즈) 매수할 때의 세금·수수료·환전·계좌 활용 차이를 정리한 가이드.',
  keywords: ['해외 ETF', '미국 ETF 직구', 'SPY 한국', 'QQQ 한국', 'SCHD 직구', '해외 ETF 양도세', '해외 ETF 환전 수수료'],
  section: '해외상장 가이드',
  lastReviewed: '2026-04-27',
  howTo: {
    totalTime: 'PT18M',
    description: '한국 상장 미국 ETF vs 해외 직구 ETF의 세금·수수료·환전·계좌 활용을 5단계로 비교.',
  },
  sections: [
    {
      heading: '한국 상장 미국 ETF vs 해외 직구 — 가장 큰 차이는 세금',
      paragraphs: [
        '한국 상장 미국 ETF(예: KODEX 미국S&P500): 분배금에 15.4% 배당소득세, 매매차익에는 별도 세금 없음(국내 상장 금융상품 기준).',
        '해외 직구 ETF(예: SPY): 분배금에 미국 원천징수 15% + 한국 종합과세 합산 가능. 매매차익에는 양도소득세 22%(연 250만원 기본 공제 후).',
        '결론: 매매차익 비중이 크면 한국 상장이 유리, 분배금 위주면 비슷, 250만원 이하 양도차익만 있으면 해외 직구 비과세 활용 가능.',
      ],
    },
    {
      heading: '수수료·환전 — 직구 시 추가로 드는 비용',
      paragraphs: [
        '해외 직구 ETF는 매매 수수료(증권사별 0.07~0.25%)와 환전 수수료(스프레드 1~2원)가 추가로 발생합니다.',
        '한국 상장 ETF는 환전 없이 원화 거래로 매매 수수료만 부담(보통 0.015%).',
        '소액·잦은 거래는 한국 상장이 유리하고, 1회 대량 매수 후 장기 보유는 해외 직구의 추가 비용이 상쇄됩니다.',
      ],
    },
    {
      heading: 'ISA·연금저축 — 해외 직구는 매수 불가',
      paragraphs: [
        'ISA·연금저축·IRP에서는 해외 직구 ETF를 매수할 수 없습니다. 절세 계좌를 활용하려면 한국 상장 미국 ETF를 매수해야 합니다.',
        '연 200만원 비과세(ISA), 세액공제(연금저축), 과세이연(IRP)을 활용하려면 KODEX·TIGER·ACE 등의 한국 상장 시리즈가 필수.',
        '일반 계좌에 여유 자금이 있고 250만원/년 양도차익 비과세를 활용한다면 해외 직구도 좋은 선택지입니다.',
      ],
    },
    {
      heading: '대표 페어 비교 — 같은 기초자산, 다른 상장지',
      paragraphs: [
        '미국 직접 상장 ETF와 한국 상장 동일 지수 ETF의 대표 페어:',
        '- S&P500: SPY/VOO ↔ KODEX 미국S&P500, TIGER 미국S&P500',
        '- Nasdaq100: QQQ/QQQM ↔ KODEX 미국나스닥100, TIGER 미국나스닥100TR',
        '- 배당: SCHD ↔ KODEX 미국배당다우존스, ACE 미국배당다우존스',
        '같은 지수라도 운용보수·환헷지 옵션·분배 정책이 다르므로 종목 페이지에서 직접 확인하세요.',
      ],
      dataBlock: 'top-volume-snapshot',
    },
    {
      heading: '직구가 유리한 상황 / 한국 상장이 유리한 상황',
      paragraphs: [
        '직구 유리: 250만원/년 양도차익 비과세 적극 활용 / 미국 시장에 직접 자금 분산 / 대량 1회 매수 후 장기 보유.',
        '한국 상장 유리: ISA·연금저축·IRP 활용 / 분배금 위주 캐시플로 / 환전·수수료 부담 최소화.',
        '두 시장에 분산하는 것도 일반적입니다. 절세 계좌(ISA·연금)는 한국 상장으로, 일반 계좌에서 양도차익 250만원 이하는 직구로.',
      ],
    },
    {
      heading: '함께 보면 좋은 데일리 분석',
      paragraphs: ['해외주식 카테고리의 최근 분석입니다.'],
      dataBlock: 'related-posts:flow',
    },
  ],
  faq: [
    {
      question: 'SPY와 KODEX 미국S&P500 중 어느 게 유리한가요?',
      answer: '소액·잦은 거래는 KODEX(한국 상장)가, 1회 대량·장기 보유는 SPY(직구)가 유리합니다. 절세 계좌(ISA·연금) 활용은 KODEX만 가능.',
    },
    {
      question: '해외 직구 ETF의 양도소득세는 어떻게 계산되나요?',
      answer: '연간 매매 차익 합계에서 250만원을 공제하고, 그 초과분에 22%(주민세 포함)를 부과합니다. 손실은 5년간 이월공제 가능.',
    },
    {
      question: '환전은 언제 하는 게 좋나요?',
      answer: '대부분 증권사가 24시간 환전 가능하지만, 평일 09:00~15:30이 유동성이 가장 좋습니다. 환율 변동에 민감하다면 분할 환전(여러 회로 나눠 환전)이 일반적입니다.',
    },
  ],
};

export const GUIDES: GuideDef[] = [
  monthlyDividend,
  coveredCall,
  defenseEtf,
  aiSemiEtf,
  retirement,
  usDividend,
  currencyHedge,
  overseasEtf,
];

export function getGuideBySlug(slug: string): GuideDef | null {
  return GUIDES.find(g => g.slug === slug) || null;
}
