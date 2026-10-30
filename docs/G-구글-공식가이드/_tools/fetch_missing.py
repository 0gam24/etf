# -*- coding: utf-8 -*-
"""
누락된 Google 검색 센터 문서를 새 폴더 구조(G-구글-공식가이드)에 맞춰 내려받는다.

scrape_search_central.py 는 원본 URL 구조(search-central-docs/docs/...)로 저장하지만,
이 폴더는 01~07 섹션 구조로 재편되어 있다. 이 스크립트는 그 매핑을 적용한다.

사용법:
    python _tools/fetch_missing.py                # audit 로 찾은 기본 목록
    python _tools/fetch_missing.py URL [URL ...]  # 지정한 URL만
"""
import os
import re
import sys
import time
import urllib.parse as up

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md

LANG = "ko"
DELAY = 1.0
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
# 2026년 Google이 크롤링 문서를 /search/docs 밖 별도 섹션으로 분리했다.
CRAWLING = "08-crawling-크롤링전문"

# 하위 폴더를 가진 경로 — 섹션 랜딩 문서는 00-개요.md 로 저장한다.
HAS_CHILDREN = {
    ("crawling-indexing", "amp"), ("crawling-indexing", "javascript"),
    ("crawling-indexing", "mobile"), ("crawling-indexing", "robots"),
    ("crawling-indexing", "sitemaps"),
    ("monitor-debug", "search-operators"), ("monitor-debug", "security"),
    ("specialty", "ecommerce"), ("specialty", "explicit"),
    ("specialty", "international"),
}

BODY_SELECTORS = [
    "div.devsite-article-body", "article.devsite-article",
    "main#main-content", "main.devsite-main-content", "article", "main",
]
NOISE_SELECTORS = [
    "devsite-toc", "devsite-feedback", "devsite-thumb-rating",
    "devsite-page-rating", "devsite-bookmark", "devsite-recommendations",
    "nav", "script", "style", "noscript", "textarea",
    ".devsite-article-meta", ".devsite-banner", ".devsite-page-nav",
]

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"),
    "Accept-Language": "ko,en;q=0.8",
})

DEFAULT_MISSING = [
    "/search/docs/appearance/search-result-features",
    "/search/docs/appearance/structured-data/practice-problems",
    "/search/docs/crawling-indexing/crawling-managing-faceted-navigation",
    "/search/docs/crawling-indexing/google-common-crawlers",
    "/search/docs/crawling-indexing/google-special-case-crawlers",
    "/search/docs/crawling-indexing/large-site-managing-crawl-budget",
    "/search/docs/crawling-indexing/mobile",
    "/search/docs/crawling-indexing/overview-google-crawlers",
    "/search/docs/crawling-indexing/read-aloud-user-agent",
    "/search/docs/crawling-indexing/reduce-crawl-rate",
    "/search/docs/crawling-indexing/robots/create-robots-txt",
    "/search/docs/crawling-indexing/robots/robots_txt",
    "/search/docs/crawling-indexing/robots/submit-updated-robots-txt",
    "/search/docs/crawling-indexing/safesearch",
    "/search/docs/crawling-indexing/verifying-googlebot",
    "/search/docs/monitor-debug/security/what-is-hacked",
    "/search/docs/appearance/package-tracking",  # 2026-07-14 갱신분 재수집
]


def local_path(url_path):
    """/search/docs/... 또는 /crawling/docs/... -> 새 구조의 로컬 파일 경로"""
    if url_path.startswith("/crawling/docs"):
        p = url_path[len("/crawling/docs"):].strip("/")
        return os.path.join(ROOT, CRAWLING, *(p.split("/") if p else ["00-개요"])) + ".md"
    p = url_path[len("/search/docs"):].strip("/")
    if not p:
        return os.path.join(ROOT, "_원본-랜딩페이지.md")
    parts = p.split("/")
    sec, rest = parts[0], parts[1:]

    if sec == "appearance" and rest[:1] == ["structured-data"]:
        tail = rest[1:]
        return os.path.join(ROOT, SD, ("00-개요" if not tail else "/".join(tail)) + ".md")
    if sec not in SEC:
        return None
    base = os.path.join(ROOT, SEC[sec])
    if not rest:
        return os.path.join(base, "00-개요.md")
    if len(rest) == 1 and (sec, rest[0]) in HAS_CHILDREN:
        return os.path.join(base, rest[0], "00-개요.md")
    return os.path.join(base, *rest[:-1], rest[-1] + ".md")


def extract_body(html):
    soup = BeautifulSoup(html, "lxml")
    node = None
    for sel in BODY_SELECTORS:
        node = soup.select_one(sel)
        if node and node.get_text(strip=True):
            break
        node = None
    if node is None:
        return None, None
    title = ""
    h1 = soup.select_one("h1")
    if h1:
        title = h1.get_text(strip=True)
    if not title and soup.title:
        title = soup.title.get_text(strip=True)
    for sel in NOISE_SELECTORS:
        for t in node.select(sel):
            t.decompose()
    markdown = md(str(node), heading_style="ATX", strip=["button"], code_language="")
    return re.sub(r"\n{4,}", "\n\n\n", markdown).strip(), title


def header(url, title):
    t = title or url.rstrip("/").rsplit("/", 1)[-1]
    return (f"# {t}\n\n"
            f"> **출처(Source):** {url}?hl={LANG}\n"
            f"> **저작자(Attribution):** Google\n"
            f"> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)\n"
            f"> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.\n"
            f"> 원문의 최신 내용은 위 출처 링크를 확인하세요.\n\n---\n\n")


def main(paths):
    ok = fail = 0
    for i, p in enumerate(paths, 1):
        path = up.urlsplit(p).path.rstrip("/") if p.startswith("http") else p.rstrip("/")
        url = "https://developers.google.com" + path
        dest = local_path(path)
        if dest is None:
            print(f"[{i}/{len(paths)}] 건너뜀(대상 밖): {path}")
            continue
        try:
            r = SESSION.get(f"{url}?hl={LANG}", timeout=40, allow_redirects=True)
        except Exception as e:
            fail += 1
            print(f"[{i}/{len(paths)}] 오류 {path} -> {e}")
            time.sleep(DELAY)
            continue
        if r.status_code != 200:
            fail += 1
            print(f"[{i}/{len(paths)}] HTTP {r.status_code} {path}")
            time.sleep(DELAY)
            continue
        body, title = extract_body(r.text)
        if not body:
            fail += 1
            print(f"[{i}/{len(paths)}] 본문 없음 {path}")
            time.sleep(DELAY)
            continue
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            f.write(header(url, title) + body + "\n")
        ok += 1
        print(f"[{i}/{len(paths)}] 저장 {os.path.relpath(dest, ROOT)}  ({title})")
        time.sleep(DELAY)
    print(f"\n완료: 저장 {ok}개 / 실패 {fail}개")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or DEFAULT_MISSING))
