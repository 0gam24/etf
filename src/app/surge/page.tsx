import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostsByCategory } from '@/lib/posts';
import { getLatestEtfData } from '@/lib/data';
import {
  computeMarketAvgVolume,
  findEtfByCode,
  groupTopGainersByTheme,
  type RawEtf,
} from '@/lib/surge';
import SurgeHero from '@/components/SurgeHero';
import SurgeThemeTracker from '@/components/SurgeThemeTracker';
import NextChapterCta from '@/components/NextChapterCta';
import Breadcrumbs from '@/components/Breadcrumbs';
import FaqSection from '@/components/FaqSection';
import { CATEGORY_FAQ, CATEGORY_FAQ_TITLE } from '@/lib/category-faq';
import SurgeRecentList from '@/components/SurgeRecentList';

export const metadata: Metadata = {
  title: '급등 테마 분석 — Daily ETF Pulse',
  description:
    '오늘 거래량·등락률 1위 ETF의 도화선과 위험 신호 · 테마 트래커로 자금이 몰리는 섹터를 한눈에. "이 ETF 사도 되나"에 답하는 의사결정 도구.',
};

const RECENT_LIMIT = 8;

export default function SurgeLandingPage() {
  const posts = getPostsByCategory('surge');
  const etfData = getLatestEtfData();
  const etfList: RawEtf[] = (etfData?.etfList || []) as RawEtf[];
  const marketAvgVolume = computeMarketAvgVolume(etfList);

  // 오늘의 featured surge: 가장 최근 surge 포스트의 첫 ticker → 그 ETF
  const featuredPost = posts[0] ?? null;
  const featuredTicker = featuredPost?.meta.tickers?.[0];
  const featuredEtf = featuredTicker ? findEtfByCode(etfList, featuredTicker) : null;

  // 만약 포스트가 가리키는 ETF가 데이터에 없으면, 등락률 1위 ETF로 폴백
  const fallbackEtf = !featuredEtf && etfList.length > 0
    ? [...etfList].sort((a, b) => b.changeRate - a.changeRate)[0]
    : null;

  const heroEtf = featuredEtf || fallbackEtf;

  const themeGroups = groupTopGainersByTheme(etfList, posts, 30);

  return (
    <div className="surge-landing animate-fade-in">
      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '급등 테마 분석', href: '/surge' },
        ]}
      />
      <SurgeHero
        post={featuredPost}
        etf={heroEtf}
        marketAvgVolume={marketAvgVolume}
        baseDate={etfData?.baseDate}
      />

      <div className="surge-landing-body">
        <SurgeThemeTracker groups={themeGroups} />

        <SurgeRecentList
          posts={posts.slice(0, RECENT_LIMIT)}
          etfs={etfList}
          marketAvgVolume={marketAvgVolume}
        />

        {/* 저자 카드 */}
        {featuredPost && featuredPost.meta.authorId && (
          <section className="pulse-author-card">
            <div className="pulse-author-head">
              <span className="pulse-author-avatar">{featuredPost.meta.author.charAt(0)}</span>
              <div>
                <div className="pulse-author-name">{featuredPost.meta.author}</div>
                <div className="pulse-author-role">급등 테마 집필</div>
              </div>
              <Link href={`/author/${featuredPost.meta.authorId}`} className="pulse-author-link">
                프로필 보기 →
              </Link>
            </div>
            <p className="pulse-author-quote">
              &ldquo;거래량과 도화선만으로 매수 결정을 내리지 말고, 위험 신호와 구성종목까지 함께 보세요.&rdquo;
            </p>
          </section>
        )}

        <FaqSection title={CATEGORY_FAQ_TITLE.surge} items={CATEGORY_FAQ.surge} />

        <NextChapterCta
          label="다음 챕터"
          copy="기관·외국인의 손이 일주일째 어디로 옮겨가는지 보러 가기"
          href="/flow"
        />
      </div>
    </div>
  );
}
