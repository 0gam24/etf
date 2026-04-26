import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostsByCategory } from '@/lib/posts';
import { getKrxEtfMeta, getLatestEtfData } from '@/lib/data';
import {
  buildWeekTimeline,
  computeRecurringThemes,
  computeTickerDiff,
} from '@/lib/pulse';
import PulseTodayHero from '@/components/PulseTodayHero';
import PulseDiff from '@/components/PulseDiff';
import PulseWeekTimeline from '@/components/PulseWeekTimeline';
import PulseRecurringThemes from '@/components/PulseRecurringThemes';
import NextChapterCta from '@/components/NextChapterCta';
import Breadcrumbs from '@/components/Breadcrumbs';
import FaqSection from '@/components/FaqSection';
import { CATEGORY_FAQ, CATEGORY_FAQ_TITLE } from '@/lib/category-faq';
import RecommendBox from '@/components/RecommendBox';

export const metadata: Metadata = {
  title: '오늘의 관전포인트 — Daily ETF Pulse',
  description:
    '매일 오전 9시 전, 오늘 시장을 움직일 ETF 핵심 포인트 · 어제 대비 변화 · 이번 주 반복 등장 종목을 한눈에.',
};

const RECENT_LIST_LIMIT = 8;
const RECURRING_WINDOW_DAYS = 7;

export default function PulseLandingPage() {
  const posts = getPostsByCategory('pulse');
  const today = posts[0] ?? null;
  const yesterday = posts[1] ?? null;

  const diff = computeTickerDiff(today, yesterday);
  const timeline = buildWeekTimeline(posts);

  // ETF 정식명 resolver — KRX 매핑 우선, 없으면 etfList(시세)에서 fallback
  const etfList = (getLatestEtfData()?.etfList || []) as Array<{ code: string; name: string }>;
  const resolveName = (ticker: string): string | null => {
    const krx = getKrxEtfMeta(ticker);
    if (krx?.name) return krx.name;
    const fromPrice = etfList.find(e => e.code.toUpperCase() === ticker.toUpperCase());
    return fromPrice?.name || null;
  };
  const themes = computeRecurringThemes(posts, RECURRING_WINDOW_DAYS, 5, resolveName);
  const todayIso = today ? new Date(today.meta.date).toISOString().slice(0, 10) : '';

  const recent = posts.slice(0, RECENT_LIST_LIMIT);

  return (
    <div className="pulse-landing animate-fade-in">
      <Breadcrumbs
        items={[
          { name: '홈', href: '/' },
          { name: '오늘의 관전포인트', href: '/pulse' },
        ]}
      />
      <PulseTodayHero today={today} />

      <RecommendBox position="top" category="general" />

      <div className="pulse-landing-body">
        <PulseDiff diff={diff} hasYesterday={!!yesterday} />

        <PulseWeekTimeline cells={timeline} todayIso={todayIso} />

        <PulseRecurringThemes themes={themes} windowDays={RECURRING_WINDOW_DAYS} />

        {/* 저자 인사이트 카드 */}
        {today && today.meta.authorId && (
          <section className="pulse-author-card">
            <div className="pulse-author-head">
              <span className="pulse-author-avatar">{today.meta.author.charAt(0)}</span>
              <div>
                <div className="pulse-author-name">{today.meta.author}</div>
                <div className="pulse-author-role">오늘의 관전포인트 집필</div>
              </div>
              <Link href={`/author/${today.meta.authorId}`} className="pulse-author-link">
                프로필 보기 →
              </Link>
            </div>
            <p className="pulse-author-quote">
              &ldquo;{today.meta.description}&rdquo;
            </p>
          </section>
        )}

        {/* 최근 발행 아카이브 */}
        <section className="pulse-archive">
          <div className="pulse-section-head">
            <h2 className="pulse-section-title">최근 발행</h2>
            <p className="pulse-section-hint">총 {posts.length}편 · 매일 오전 9시 전 업데이트</p>
          </div>
          {recent.length === 0 ? (
            <p className="pulse-section-empty">아직 발행된 글이 없습니다.</p>
          ) : (
            <ul className="pulse-archive-list">
              {recent.map(p => (
                <li key={p.meta.slug}>
                  <Link href={`/${p.meta.category}/${p.meta.slug}`} className="pulse-archive-row">
                    <span className="pulse-archive-date">
                      {new Date(p.meta.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="pulse-archive-title">{p.meta.title}</span>
                    <span className="pulse-archive-meta">{p.readingTime}분</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <FaqSection title={CATEGORY_FAQ_TITLE.pulse} items={CATEGORY_FAQ.pulse} />

        <NextChapterCta
          label="다음 챕터"
          copy="오늘 거래량 1위 ETF가 왜 올랐는지 분석 보러 가기"
          href="/surge"
        />

        <RecommendBox position="bottom" category="general" />
      </div>
    </div>
  );
}
