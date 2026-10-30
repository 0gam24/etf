# -*- coding: utf-8 -*-
"""
Google 검색 센터(Search Central) 문서 -> 개별 Markdown 파일 아카이버

문서 라이선스: CC BY 4.0 (저작자: Google)
https://developers.google.com/site-policies
개인 개발 참고자료 용도.
"""

import os
import re
import sys
import time
import urllib.parse as up

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md

# ---------------------------------------------------------------- 설정
LANG = "ko"                       # ?hl=ko
DELAY = 1.0                       # 요청 사이 지연(초)
OUT_DIR = "search-central-docs"
PATH_FILTER = "/search/docs"

# --force : 이미 저장된 파일도 다시 받아 덮어쓴다.
FORCE = "--force" in sys.argv

PRIMARY_SITEMAP = "https://developers.google.com/search/sitemap.xml"
FALLBACK_SITEMAP = "https://developers.google.com/sitemap.xml"

# 본문 컨테이너 후보 (실제 페이지 HTML 확인 결과 순서)
BODY_SELECTORS = [
    "div.devsite-article-body",       # 실제 본문 컨테이너 (확인됨)
    "article.devsite-article",        # 기사 래퍼
    "main#main-content",              # 메인 콘텐츠 영역
    "main.devsite-main-content",
    "article",
    "main",
]

# 본문에서 제거할 잡음 요소
NOISE_SELECTORS = [
    "devsite-toc", "devsite-feedback", "devsite-thumb-rating",
    "devsite-page-rating", "devsite-bookmark", "devsite-recommendations",
    "nav", "script", "style", "noscript",
    # devsite는 코드 샘플마다 숨겨진 복사용 textarea를 함께 넣는다.
    # 지우지 않으면 모든 코드 블록이 (코드펜스 없는) 중복 텍스트로 두 번 나온다.
    "textarea",
    ".devsite-article-meta", ".devsite-banner", ".devsite-page-nav",
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko,en;q=0.8",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)


def log(msg):
    print(msg, flush=True)


# ---------------------------------------------------------------- 사이트맵
def fetch(url, timeout=40):
    r = SESSION.get(url, timeout=timeout)
    r.raise_for_status()
    return r


def parse_sitemap(url, seen=None, depth=0):
    """
    사이트맵을 재귀적으로 파싱한다.
    <sitemapindex>면 하위 사이트맵을 모두 따라가고, <urlset>이면 URL을 수집한다.
    """
    if seen is None:
        seen = set()
    if url in seen or depth > 4:
        return []
    seen.add(url)

    try:
        resp = fetch(url)
    except Exception as e:
        log(f"  [사이트맵 실패] {url} -> {e}")
        return []

    text = resp.text
    # XML이 아니면(404 HTML 등) 무시
    if "<loc>" not in text:
        log(f"  [사이트맵 아님] {url} (HTTP {resp.status_code})")
        return []

    locs = re.findall(r"<loc>\s*(.*?)\s*</loc>", text, re.S)
    is_index = "<sitemapindex" in text

    if is_index:
        log(f"  사이트맵 인덱스 발견: {url} -> 하위 {len(locs)}개")
        out = []
        for i, sub in enumerate(locs, 1):
            sub = sub.strip()
            log(f"    [{i}/{len(locs)}] {sub}")
            out.extend(parse_sitemap(sub, seen, depth + 1))
        return out

    return [l.strip() for l in locs]


def canonical(url):
    """?hl= 등 쿼리를 제거한 정규 URL. 언어 변형 중복 제거용."""
    p = up.urlsplit(url)
    path = p.path.rstrip("/")
    return up.urlunsplit((p.scheme, p.netloc, path, "", ""))


def collect_urls():
    log("[1/3] 사이트맵에서 문서 URL 수집")

    log(f"  1차 시도: {PRIMARY_SITEMAP}")
    urls = [u for u in parse_sitemap(PRIMARY_SITEMAP) if PATH_FILTER in u]

    if len(urls) < 50:
        log(f"  1차 결과 {len(urls)}개 -> 부족. 상위 사이트맵으로 재시도: {FALLBACK_SITEMAP}")
        urls = [u for u in parse_sitemap(FALLBACK_SITEMAP) if PATH_FILTER in u]

    # 언어 변형 중복 제거
    uniq = sorted({canonical(u) for u in urls})
    log(f"  원본 {len(urls)}개 -> 언어 변형 중복 제거 후 {len(uniq)}개")
    return uniq


# ---------------------------------------------------------------- 본문 추출
def extract_body(html):
    soup = BeautifulSoup(html, "lxml")

    node = None
    used = None
    for sel in BODY_SELECTORS:
        node = soup.select_one(sel)
        if node and node.get_text(strip=True):
            used = sel
            break
        node = None

    if node is None:
        return None, None, None

    # 제목
    title = ""
    h1 = soup.select_one("h1")
    if h1:
        title = h1.get_text(strip=True)
    if not title and soup.title:
        title = soup.title.get_text(strip=True)

    # 잡음 제거
    for sel in NOISE_SELECTORS:
        for t in node.select(sel):
            t.decompose()

    markdown = md(
        str(node),
        heading_style="ATX",
        strip=["button"],
        code_language="",
    )
    # 과도한 빈 줄 정리
    markdown = re.sub(r"\n{4,}", "\n\n\n", markdown).strip()
    return markdown, title, used


def out_path(url):
    """원래 URL 경로 구조를 유지한 저장 경로."""
    path = up.urlsplit(url).path.strip("/")      # search/docs/appearance/...
    parts = [p for p in path.split("/") if p]
    if parts[:1] == ["search"]:
        parts = parts[1:]                        # docs/appearance/...
    if not parts:
        parts = ["index"]
    parts = [re.sub(r'[<>:"|?*\\]', "_", p) for p in parts]
    return os.path.join(OUT_DIR, *parts[:-1], parts[-1] + ".md")


def header(url, title):
    src = f"{url}?hl={LANG}"
    t = title or url.rstrip("/").rsplit("/", 1)[-1]
    return (
        f"# {t}\n\n"
        f"> **출처(Source):** {src}\n"
        f"> **저작자(Attribution):** Google\n"
        f"> **라이선스(License):** [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)\n"
        f"> 이 문서는 Google 검색 센터 문서를 Markdown으로 변환한 사본입니다.\n"
        f"> 원문의 최신 내용은 위 출처 링크를 확인하세요.\n\n"
        f"---\n\n"
    )


def links_in(html, base):
    """페이지 안의 같은 사이트 /search/docs 링크를 정규 URL로 뽑아낸다."""
    soup = BeautifulSoup(html, "lxml")
    found = set()
    for a in soup.select("a[href]"):
        href = up.urljoin(base, a["href"])
        if not href.startswith("https://developers.google.com"):
            continue
        if PATH_FILTER not in href:
            continue
        found.add(canonical(href))
    return found


def links_in_markdown(path):
    """이미 저장된 .md에서 /search/docs 링크를 뽑아낸다(재실행 시 보강용)."""
    try:
        text = open(path, encoding="utf-8").read()
    except OSError:
        return set()
    out = set()
    for m in re.findall(r"https://developers\.google\.com(/search/docs[^)\s\"'>]*)", text):
        path_only = up.urlsplit(m).path.rstrip("/")
        if path_only:
            out.add("https://developers.google.com" + path_only)
    return out


# ---------------------------------------------------------------- 저장 로직
class Archiver:
    def __init__(self):
        self.saved = self.skipped = self.empty = self.failed = 0
        self.empty_urls = []
        self.failed_urls = []
        self.done = set()          # 이번 실행에서 처리한 정규 URL
        self.discovered = set()    # 본문에서 새로 발견한 링크

    def have_file(self, url):
        if FORCE:
            return False
        dest = out_path(url)
        return os.path.exists(dest) and os.path.getsize(dest) > 400

    def process(self, url, tag=""):
        """한 URL을 받아 저장한다. 리다이렉트되면 최종 URL 기준으로 저장/중복판정."""
        if url in self.done:
            return
        self.done.add(url)

        if self.have_file(url):
            self.skipped += 1
            # 기존 파일은 다시 받지 않되, 저장된 본문에서 링크만 수집한다.
            self.discovered |= links_in_markdown(out_path(url))
            return

        req = f"{url}?hl={LANG}"
        try:
            resp = SESSION.get(req, timeout=40, allow_redirects=True)
        except Exception as e:
            self.failed += 1
            self.failed_urls.append((req, str(e)[:120]))
            log(f"  {tag} 오류 {url} -> {e}")
            time.sleep(DELAY)
            return

        if resp.status_code != 200:
            self.failed += 1
            self.failed_urls.append((req, f"HTTP {resp.status_code}"))
            log(f"  {tag} HTTP {resp.status_code} {url}")
            time.sleep(DELAY)
            return

        # 리다이렉트 최종 목적지를 정규 URL로 사용 (guides/* -> fundamentals/* 등)
        final = canonical(resp.url)
        if PATH_FILTER not in final:
            time.sleep(DELAY)
            return
        self.done.add(final)

        self.discovered |= links_in(resp.text, resp.url)

        if self.have_file(final):
            self.skipped += 1
            time.sleep(DELAY)
            return

        body, title, _ = extract_body(resp.text)
        if not body:
            self.empty += 1
            self.empty_urls.append(req)
            log(f"  {tag} 본문 없음 {url}")
            time.sleep(DELAY)
            return

        dest = out_path(final)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            f.write(header(final, title) + body + "\n")
        self.saved += 1
        if self.saved % 25 == 0:
            log(f"  {tag} 저장 누계 {self.saved}개 (최근: {dest})")
        time.sleep(DELAY)


# ---------------------------------------------------------------- 메인
def main():
    urls = collect_urls()
    if not urls:
        log("수집된 URL이 없습니다. 종료합니다.")
        return 1

    os.makedirs(OUT_DIR, exist_ok=True)
    arc = Archiver()

    log(f"\n[2/3] 사이트맵 문서 {len(urls)}개 처리 (지연 {DELAY}s)")
    for i, url in enumerate(urls, 1):
        arc.process(url, tag=f"[{i}/{len(urls)}]")

    # 사이트맵에 없는 페이지를 본문 링크로 보강 (최대 MAX_ROUNDS 라운드)
    MAX_ROUNDS = 4
    for rnd in range(1, MAX_ROUNDS + 1):
        todo = sorted(u for u in arc.discovered - arc.done if not arc.have_file(u))
        if not todo:
            log(f"\n[보강 {rnd}] 새로 발견된 미저장 페이지 없음 -> 종료")
            break
        log(f"\n[보강 {rnd}] 링크에서 발견된 미저장 페이지 {len(todo)}개 처리")
        for i, url in enumerate(todo, 1):
            arc.process(url, tag=f"[보강{rnd} {i}/{len(todo)}]")

    log("\n[3/3] 완료")
    log(f"  신규 저장: {arc.saved} / 기존·중복 건너뜀: {arc.skipped} "
        f"/ 본문없음: {arc.empty} / 실패: {arc.failed}")
    total = sum(1 for _, _, fs in os.walk(OUT_DIR) for f in fs if f.endswith(".md"))
    log(f"  폴더 내 .md 총 개수: {total}")
    log(f"  위치: {os.path.abspath(OUT_DIR)}")

    if arc.empty_urls:
        log("\n  본문 추출 실패 URL (셀렉터 확인 필요):")
        for u in arc.empty_urls[:20]:
            log(f"    {u}")
    if arc.failed_urls:
        log("\n  요청 실패 URL (삭제·이동된 문서일 수 있음):")
        for u, e in arc.failed_urls[:30]:
            log(f"    {u} -> {e}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
