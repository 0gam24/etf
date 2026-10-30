# -*- coding: utf-8 -*-
"""
커버리지 감사 — 저장된 문서 본문의 링크와 대조해 로컬에 없는 Google 공식 문서를 찾는다.

현재 폴더 구조(01~08 섹션) 기준. 2026년 Google이 크롤링 문서를
/search/docs -> /crawling/docs 로 옮긴 것도 반영한다.

사용법: python _tools/audit_coverage.py
"""
import os
import re
import urllib.parse as up

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SEC = {
    "essentials": "01-essentials-필수정책",
    "fundamentals": "02-fundamentals-기본",
    "crawling-indexing": "03-crawling-indexing-크롤링색인",
    "appearance": "04-appearance-검색결과표시",
    "monitor-debug": "06-monitor-debug-모니터링",
    "specialty": "07-specialty-특화사이트",
}
SD = "05-structured-data-구조화데이터"
CRAWLING = "08-crawling-크롤링전문"

# 하위 폴더를 가진 경로 — 섹션 랜딩 문서는 00-개요.md 로 저장한다.
HAS_CHILDREN = {
    ("crawling-indexing", "amp"), ("crawling-indexing", "javascript"),
    ("crawling-indexing", "robots"), ("crawling-indexing", "sitemaps"),
    ("monitor-debug", "search-operators"), ("monitor-debug", "security"),
    ("specialty", "ecommerce"), ("specialty", "explicit"),
    ("specialty", "international"),
}

# 2026년 이전(移轉): 옛 /search/docs 경로 -> 새 /crawling/docs 경로
MOVED_TO_CRAWLING = {
    "crawling-indexing/crawling-managing-faceted-navigation": "faceted-navigation",
    "crawling-indexing/large-site-managing-crawl-budget": "crawl-budget",
    "crawling-indexing/http-network-errors": "troubleshooting/http-status-codes",
    "crawling-indexing/overview-google-crawlers": "crawlers-fetchers/overview-google-crawlers",
    "crawling-indexing/google-common-crawlers": "crawlers-fetchers/google-common-crawlers",
    "crawling-indexing/google-special-case-crawlers": "crawlers-fetchers/google-special-case-crawlers",
    "crawling-indexing/google-user-triggered-fetchers": "crawlers-fetchers/google-user-triggered-fetchers",
    "crawling-indexing/google-producer": "crawlers-fetchers/google-user-triggered-fetchers",
    "crawling-indexing/read-aloud-user-agent": "crawlers-fetchers/read-aloud-user-agent",
    "crawling-indexing/reduce-crawl-rate": "crawlers-fetchers/reduce-crawl-rate",
    "crawling-indexing/verifying-googlebot": "crawlers-fetchers/verify-google-requests",
    "crawling-indexing/robots/create-robots-txt": "robots-txt/create-robots-txt",
    "crawling-indexing/robots/robots_txt": "robots-txt/robots-txt-spec",
    "crawling-indexing/robots/submit-updated-robots-txt": "robots-txt/submit-updated-robots-txt",
}

# 다른 문서로 리다이렉트되어 별도 저장하지 않는 경로 (중복 방지)
REDIRECT_DUPES = {
    "appearance/search-result-features",              # -> appearance/visual-elements-gallery
    "appearance/structured-data/practice-problems",   # -> 지원 중단
    "monitor-debug/security/what-is-hacked",          # -> essentials/spam-policies
    "crawling-indexing/safesearch",                   # -> specialty/explicit/guidelines
    "crawling-indexing/mobile",                       # -> mobile/mobile-sites-mobile-first-indexing
}

# 원문에서 삭제된 경로 (404)
GONE = {
    "appearance/structured-data/articl",   # 오타 링크
    "monitor-debug/google-trends",         # -> monitor-debug/trends-start 로 대체됨
}

# /crawling/docs 쪽 제외 경로
CRAWLING_SKIP = {
    "",                                          # 섹션 랜딩 페이지 없음 (404)
    "crawlers-fetchers/google-agent",            # -> crawlers-fetchers/google-user-triggered-fetchers
}


def local_candidates(url_path):
    """공식 문서 URL 경로 -> 로컬 파일 경로 후보. None이면 감사 대상 밖, 'skip'이면 의도적 제외."""
    if url_path.startswith("/crawling/docs"):
        p = url_path[len("/crawling/docs"):].strip("/")
        if p in CRAWLING_SKIP or not p.replace("-", "").replace("/", "").replace("_", "").isalnum():
            return "skip"                        # 랜딩·리다이렉트·RSS 피드 등
        return [os.path.join(ROOT, CRAWLING, *p.split("/")) + ".md"]

    p = url_path[len("/search/docs"):].strip("/")
    if p in REDIRECT_DUPES or p in GONE:
        return "skip"
    if p in MOVED_TO_CRAWLING:
        return [os.path.join(ROOT, CRAWLING, *MOVED_TO_CRAWLING[p].split("/")) + ".md"]
    if not p:
        return [os.path.join(ROOT, "_원본-랜딩페이지.md")]

    parts = p.split("/")
    sec, rest = parts[0], parts[1:]
    if sec == "appearance" and rest[:1] == ["structured-data"]:
        tail = rest[1:]
        return [os.path.join(ROOT, SD, ("00-개요" if not tail else "/".join(tail)) + ".md")]
    if sec not in SEC:
        return None
    base = os.path.join(ROOT, SEC[sec])
    if not rest:
        return [os.path.join(base, "00-개요.md")]
    if len(rest) == 1 and (sec, rest[0]) in HAS_CHILDREN:
        return [os.path.join(base, rest[0], "00-개요.md")]
    return [os.path.join(base, *rest[:-1], rest[-1] + ".md")]


def main():
    links = set()
    total = 0
    for dp, _, fns in os.walk(ROOT):
        if "_tools" in dp:
            continue
        for fn in fns:
            if not fn.endswith(".md"):
                continue
            total += 1
            text = open(os.path.join(dp, fn), encoding="utf-8").read()
            for m in re.findall(
                    r"https://developers\.google\.com(/(?:search|crawling)/docs[^)\s\"'>]*)", text):
                path = up.urlsplit(m).path.rstrip("/")
                if path:
                    links.add(path)

    missing, skipped = [], 0
    for link in sorted(links):
        cands = local_candidates(link)
        if cands is None:
            continue
        if cands == "skip":
            skipped += 1
            continue
        if not any(os.path.exists(c) for c in cands):
            missing.append(link)

    print(f"저장된 문서: {total}")
    print(f"본문 링크에서 발견된 공식 문서 경로: {len(links)} (리다이렉트·삭제로 의도적 제외 {skipped})")
    print(f"누락: {len(missing)}")
    for m in missing:
        print("  ", m)
    if missing:
        print("\n내려받기:")
        print("  python _tools/fetch_missing.py " +
              " ".join("https://developers.google.com" + m for m in missing[:5]))


if __name__ == "__main__":
    main()
