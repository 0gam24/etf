import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostsByCategory } from '@/lib/posts';
import { getLatestEtfData, getRecentEtfSnapshots } from '@/lib/data';
import {
  computeSectorAggregates,
  pickHottestColdest,
  buildSectorTimeSeries,
  type RawEtf,
} from '@/lib/flow';
import FlowHero from '@/components/FlowHero';
import FlowExtremes from '@/components/FlowExtremes';
import FlowSectorGrid from '@/components/FlowSectorGrid';
import FlowSectorLeaders from '@/components/FlowSectorLeaders';
import FlowRecentList from '@/components/FlowRecentList';
import FlowWeeklyTrend from '@/components/FlowWeeklyTrend';
import NextChapterCta from '@/components/NextChapterCta';
import Breadcrumbs from '@/components/Breadcrumbs';
import FaqSection from '@/components/FaqSection';
import { CATEGORY_FAQ, CATEGORY_FAQ_TITLE } from '@/lib/category-faq';
import RecommendBox from '@/components/RecommendBox';

export const metadata: Metadata = {
  title: '자금 흐름 리포트 — Daily ETF Pulse',
  description:
    '오늘 섹터별 자금 유입·유출과 대장 ETF · 가장 뜨거운/차가운 섹터 · 분석 글이 있는 테마는 즉시 연결. 중장기 포지셔닝을 위한 큰 그림.',
};

export default function FlowLandingPage() {
  const posts = getPostsByCategory('flow');
  const etfData = getLatestEtfData();
  const etfList: RawEtf[] = (etfData?.etfList || []) as RawEtf[];

  const sectors = computeSectorAggregates(etfList, posts);
  const { hottest, coldest } = pickHottestColdest(sectors);
  const latestPost = posts[0] ?? null;

  // 주간 추세: 최근 5영업일치 스냅샷 로드
  const recentSnapshots = getRecentEtfSnapshots(5);
  const sectorSeries = buildSectorTimeSeries(recentSnapshots);

  return (
    <div className="flow-landing animate-fade-in">
      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '자금 흐름 리포트', href: '/flow' },
        ]}
      />
      <FlowHero
        hottest={hottest}
        coldest={coldest}
        totalEtfs={etfList.length}
        baseDate={etfData?.baseDate}
        latestPost={latestPost}
      />

      <RecommendBox position="top" category="general" />

      <div className="flow-landing-body">
        <FlowExtremes hottest={hottest} coldest={coldest} />

        <FlowWeeklyTrend series={sectorSeries} daysAvailable={recentSnapshots.length} />

        <FlowSectorGrid sectors={sectors} />

        <FlowSectorLeaders sectors={sectors} />

        <FlowRecentList posts={posts} />

        {/* 저자 카드 */}
        {latestPost && latestPost.meta.authorId && (
          <section className="pulse-author-card">
            <div className="pulse-author-head">
              <span className="pulse-author-avatar">{latestPost.meta.author.charAt(0)}</span>
              <div>
                <div className="pulse-author-name">{latestPost.meta.author}</div>
                <div className="pulse-author-role">자금 흐름 리포트 집필</div>
              </div>
              <Link href={`/author/${latestPost.meta.authorId}`} className="pulse-author-link">
                프로필 보기 →
              </Link>
            </div>
            <p className="pulse-author-quote">
              &ldquo;{latestPost.meta.description}&rdquo;
            </p>
          </section>
        )}

        <p className="flow-disclaimer">
          오늘 1일치 시세 기반 스냅샷입니다. 주간·월간 누적 자금 흐름은 시계열 데이터가 누적된 후 자동 보강될 예정입니다.
        </p>

        <FaqSection title={CATEGORY_FAQ_TITLE.flow} items={CATEGORY_FAQ.flow} />

        <NextChapterCta
          label="다음 챕터"
          copy="은퇴 자산이 매달 통장에 꽂히려면 얼마가 필요한지 계산하기"
          href="/income"
        />

        <RecommendBox position="bottom" category="general" />
      </div>
    </div>
  );
}
