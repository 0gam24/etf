import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { getPostsByCategory, CATEGORY_NAMES, ACCOUNT_CATEGORIES } from '@/lib/posts';
import { getGuideBySlug } from '@/lib/guides';
import { getLatestEtfData, getEtfsBySector } from '@/lib/data';
import type { RawEtf } from '@/lib/surge';
import Breadcrumbs from '@/components/Breadcrumbs';
import FaqSection from '@/components/FaqSection';
import RecommendBox from '@/components/RecommendBox';
import { buildItemListSchema, jsonLd } from '@/lib/schema';
import { buildPageMetadata } from '@/lib/site-meta';

/**
 * /account/{type} — 절세계좌별 ETF 허브
 *
 *   2026-08-11 온페이지 감사 결과 재구성:
 *     ① 발행 글이 0편이라 본문에 H2가 하나도 없고 내용 대부분이 추천 도서 카드였다.
 *     ② hero 윗줄에 운영용 태그("연금·IRP 고단가 키워드")가 그대로 노출되고 있었다.
 *        수익화 관련 표현은 시청자 화면에 노출 금지(CLAUDE.md UX 카피 규칙) → 제거.
 *     ③ "Month 3 로드맵에서 집중 발행 예정" 같은 운영 메타 문구도 제거.
 *   보유 중인 가이드 233편과 KRX 종목 데이터를 엮어 실제 답이 있는 허브로 바꾼다.
 *
 *   세부 수치(한도·세율)는 본 페이지에서 단정하지 않고 검증된 가이드로 연결한다(YMYL).
 */

interface PageProps {
  params: Promise<{ type: string }>;
}

const ACCOUNT_META: Record<string, {
  icon: string;
  desc: string;
  intro: string;
  guideSlugs: string[];
  faq: { question: string; answer: string }[];
}> = {
  irp: {
    icon: '🏦',
    desc: '퇴직연금(IRP) 계좌에서 담을 수 있는 ETF와 계좌 운용 시 알아둘 점을 정리했습니다.',
    intro: 'IRP는 노후 자금을 모으면서 세액공제를 받을 수 있는 계좌입니다. 다만 담을 수 있는 상품에 제한이 있고, 중도 인출 조건도 일반 계좌와 다릅니다. 계좌의 규칙을 먼저 이해한 뒤 종목을 고르는 편이 순서에 맞습니다.',
    guideSlugs: ['retirement', 'irp-disadvantages', 'pension-savings-vs-irp', 'pension-irp-combined-tax-credit', 'default-option-pension'],
    faq: [
      { question: 'IRP에서는 아무 ETF나 살 수 있나요?', answer: '아닙니다. 연금계좌는 담을 수 있는 상품에 제한이 있어 레버리지·인버스 같은 파생형 상품은 편입할 수 없고, 위험자산 비중에도 한도가 있습니다. 자세한 제한은 관련 가이드에서 확인하세요.' },
      { question: 'IRP와 연금저축을 둘 다 만들어야 하나요?', answer: '두 계좌는 세액공제 한도를 합산해서 따지며, 인출 규칙과 담을 수 있는 상품 범위가 서로 다릅니다. 본인의 소득과 인출 계획에 따라 유불리가 갈리므로 비교 가이드를 참고하는 편이 좋습니다.' },
      { question: '중도에 돈을 빼면 어떻게 되나요?', answer: '연금 목적 외로 중도 인출하면 그동안 받은 세제 혜택이 회수되는 방식으로 과세됩니다. 인출 사유에 따라 예외가 인정되는 경우도 있으니 조건을 미리 확인해 두세요.' },
    ],
  },
  isa: {
    icon: '🛡️',
    desc: 'ISA 계좌에서 담기 좋은 ETF와 계좌 유형·인출 규칙을 정리했습니다.',
    intro: 'ISA는 여러 상품을 한 계좌에 담고 손익을 합쳐 계산한 뒤, 일정 한도까지 세제 혜택을 주는 계좌입니다. 계좌 유형(중개형·신탁형)과 의무 보유 기간에 따라 활용법이 달라집니다.',
    guideSlugs: ['isa-account-etf', 'isa-account-types', 'isa-vs-pension', 'isa-withdrawal-rules', 'isa-dividend-tax-benefit'],
    faq: [
      { question: 'ISA에서 해외 ETF도 살 수 있나요?', answer: '국내 상장 ETF는 담을 수 있지만, 해외 거래소에 상장된 종목은 직접 담을 수 없습니다. 미국 지수를 담고 싶다면 국내에 상장된 추종 ETF를 이용하게 됩니다.' },
      { question: 'ISA는 언제 해지하는 게 좋나요?', answer: '의무 보유 기간을 채워야 세제 혜택을 받을 수 있고, 만기 자금을 연금계좌로 옮기면 추가 혜택이 있는 경우도 있습니다. 만기 처리 방법은 관련 가이드에서 비교해 두었습니다.' },
      { question: '손실이 난 종목이 있으면 어떻게 되나요?', answer: 'ISA는 계좌 안의 이익과 손실을 합산해 계산하는 것이 일반 계좌와 다른 점입니다. 그래서 손익이 엇갈리는 여러 상품을 함께 담을 때 유리해질 수 있습니다.' },
    ],
  },
  pension: {
    icon: '💼',
    desc: '연금저축 계좌에서 담을 수 있는 ETF와 인출·과세 규칙을 정리했습니다.',
    intro: '연금저축은 적립할 때 세액공제를 받고, 나중에 연금으로 받을 때 낮은 세율로 과세되는 구조입니다. 적립 단계보다 인출 단계의 규칙이 실제 손에 쥐는 금액을 좌우하는 경우가 많습니다.',
    guideSlugs: ['retirement', 'pension-savings-vs-fund', 'pension-withdrawal-tax', 'pension-account-etf-restrictions', 'pension-fund-etf-portfolio'],
    faq: [
      { question: '연금저축과 연금저축보험은 다른가요?', answer: '적립금을 어디에 굴리는지가 다릅니다. 펀드형은 ETF·펀드로 직접 운용할 수 있고, 보험형은 공시이율 등으로 운용됩니다. 이전이 가능한 경우도 있어 비교 가이드를 참고하세요.' },
      { question: '연금으로 받을 때 세금은 어떻게 되나요?', answer: '연금 형태로 나눠 받으면 일시금으로 받을 때보다 낮은 세율이 적용되는 구조입니다. 수령 나이와 기간에 따라 세율이 달라지므로 인출 계획을 미리 세우는 편이 좋습니다.' },
      { question: '한도를 넘겨 넣으면 어떻게 되나요?', answer: '한도를 초과해 납입한 금액은 세액공제를 받지 못하지만, 다음 해로 이월해 공제받는 방법이 있습니다. 초과납입 처리 방법은 별도 가이드에 정리해 두었습니다.' },
    ],
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const key = `account/${type}`;
  const name = CATEGORY_NAMES[key];
  if (!name) return { title: '계좌 가이드를 찾을 수 없습니다' };
  const meta = ACCOUNT_META[type];
  // meta.desc가 이미 "정리했습니다"로 끝나 뒤 문장과 겹쳤다. 겹치지 않는 정보만 덧붙인다.
  const desc = meta
    ? `${meta.desc} 계좌 규칙을 다룬 가이드 ${meta.guideSlugs.length}편과 분배금이 나오는 ETF 목록, 다른 계좌와의 세후 수익률 비교까지 한 페이지에서 확인하세요.`
    : `${name}를 활용한 ETF 전략과 계좌별 세후 수익률을 정리했습니다.`;
  return buildPageMetadata({
    title: `${name} ETF 가이드`,
    description: desc,
    url: `/account/${type}`,
    keywords: [`${name} ETF`, `${name} 추천 종목`, `${name} 세액공제`, `${name} ETF 고르는 법`, `${name} 인출`],
  });
}

export async function generateStaticParams() {
  return ACCOUNT_CATEGORIES.map(c => ({ type: c.replace('account/', '') }));
}

export default async function AccountPage({ params }: PageProps) {
  const { type } = await params;
  const key = `account/${type}`;
  const name = CATEGORY_NAMES[key];
  if (!name) notFound();

  const posts = getPostsByCategory(key);
  const meta = ACCOUNT_META[type];
  const guides = (meta?.guideSlugs || []).map(s => getGuideBySlug(s)).filter(Boolean);
  // 절세계좌에서 실제로 많이 담는 유형 — 분배금이 나오는 ETF
  const etfList = (getLatestEtfData()?.etfList || []) as RawEtf[];
  const incomeEtfs = getEtfsBySector('커버드콜·월배당', '', 8, etfList);

  const itemListSchema = guides.length
    ? buildItemListSchema(guides.map(g => ({ url: `/guide/${g!.slug}`, name: g!.title })), `${name} 관련 가이드 ${guides.length}편`)
    : null;

  return (
    <div className="animate-fade-in">
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />
      )}

      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '가이드', href: '/guide' },
          { name, href: `/account/${type}` },
        ]}
      />

      <section className="category-hero" style={{ paddingBottom: '2.5rem' }}>
        <div className="category-hero-inner">
          <span className="category-hero-icon">{meta?.icon}</span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '0.2em', marginBottom: '0.75rem', textTransform: 'uppercase' }}>절세계좌</div>
          <h1 className="category-hero-title">{name} ETF 가이드</h1>
          <p className="category-hero-desc">{meta?.desc}</p>
        </div>
      </section>

      <div className="guide-article-body">
        {meta?.intro && <p className="guide-article-p">{meta.intro}</p>}

        {/* 1. 계좌 규칙을 다루는 가이드 — 이 페이지의 핵심 검색 의도 */}
        {guides.length > 0 && (
          <section className="guide-article-section-block">
            <h2 className="guide-article-h2">{name} 계좌, 먼저 확인할 것</h2>
            <p className="guide-article-p">
              한도·세율 같은 구체적인 숫자는 해마다 달라질 수 있어, 각 주제별 가이드에서 최신 기준으로 정리하고 있습니다.
            </p>
            <ul className="guide-index-list">
              {guides.map(g => (
                <li key={g!.slug} className="guide-index-card">
                  <Link href={`/guide/${g!.slug}`} prefetch={false}>
                    <div className="guide-index-section">{g!.section}</div>
                    <h3 className="guide-index-card-title">{g!.title}</h3>
                    <p className="guide-index-card-tagline">{g!.tagline}</p>
                    <span className="guide-index-cta">가이드 열기 <ArrowRight size={14} strokeWidth={2.5} /></span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 2. 실제로 담게 되는 종목 */}
        {incomeEtfs.length > 0 && (
          <section className="guide-article-section-block">
            <h2 className="guide-article-h2">{name}에서 자주 담는 분배금 ETF</h2>
            <p className="guide-article-p">
              절세계좌는 분배금에 대한 과세를 미루거나 낮출 수 있어, 분배금이 꾸준히 나오는 ETF와 함께 쓰는 경우가 많습니다.
              아래 종목을 누르면 분배 주기와 구성종목을 확인할 수 있습니다.
            </p>
            <ul className="etf-dict-related-grid">
              {incomeEtfs.map(r => (
                <li key={r.shortcode}>
                  <Link href={`/etf/${r.slug}`} prefetch={false} className="etf-dict-related-card">
                    <div className="etf-dict-related-card-head">
                      <span className="etf-dict-related-card-code">{r.shortcode}</span>
                      {r.issuer && <span className="etf-dict-related-card-issuer">{r.issuer}</span>}
                    </div>
                    <div className="etf-dict-related-card-name">{r.name}</div>
                    {r.hasPrice && typeof r.changeRate === 'number' && (
                      <div className={`etf-dict-related-card-change ${r.changeRate > 0 ? 'is-up' : r.changeRate < 0 ? 'is-down' : ''}`}>
                        {r.changeRate >= 0 ? '+' : ''}{r.changeRate.toFixed(2)}%
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="guide-article-p" style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
              종목 나열은 정보 제공 목적이며 특정 종목의 매수를 권유하지 않습니다. 투자 판단과 책임은 본인에게 있습니다.
            </p>
          </section>
        )}

        {/* 3. 계좌별 세후 수익률 비교 도구 연결 */}
        <section className="guide-article-section-block">
          <h2 className="guide-article-h2">계좌를 바꾸면 실제로 얼마나 차이 나나</h2>
          <p className="guide-article-p">
            같은 ETF를 같은 금액만큼 담아도 어느 계좌에 넣느냐에 따라 손에 남는 금액이 달라집니다.
            IRP·ISA·연금저축·일반계좌를 같은 조건으로 놓고 비교해 볼 수 있습니다.
          </p>
          <Link href="/tools/tax-compare" prefetch={false} className="guide-index-cta">
            계좌별 세후 수익률 비교해 보기 <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </section>

        {/* 4. 발행 글 (있을 때만) */}
        {posts.length > 0 && (
          <section className="guide-article-section-block">
            <h2 className="guide-article-h2">{name} 관련 분석 ({posts.length}편)</h2>
            <ul className="pulse-archive-list">
              {posts.map(post => (
                <li key={post.meta.slug}>
                  <Link href={`/account/${type}/${post.meta.slug}`} prefetch={false} className="pulse-archive-row">
                    <span className="pulse-archive-date">{new Date(post.meta.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                    <span className="pulse-archive-title">{post.meta.title}</span>
                    <span className="pulse-archive-meta">{post.readingTime}분</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <RecommendBox position="top" category="retirement" />

      {meta?.faq && <FaqSection title={`${name} 자주 묻는 질문`} items={meta.faq} />}

      <nav className="guide-article-other" aria-label="다른 절세계좌">
        <h2>다른 절세계좌 비교</h2>
        <ul>
          {ACCOUNT_CATEGORIES.map(c => c.replace('account/', '')).filter(t => t !== type).map(t => (
            <li key={t}>
              <Link href={`/account/${t}`} prefetch={false}>
                <span className="guide-article-other-title">{CATEGORY_NAMES[`account/${t}`]} ETF 가이드</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/guide" className="guide-article-other-all" prefetch={false}>
          전체 ETF 가이드 보기 <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
      </nav>

      <RecommendBox position="bottom" category="retirement" />
    </div>
  );
}
