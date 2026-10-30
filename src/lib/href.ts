/**
 * 외부 링크 주소에 한글 같은 비ASCII 문자가 있으면 퍼센트 인코딩해서 내보낸다.
 *   국가법령정보센터 조문 주소(https://www.law.go.kr/법령/소득세법/제14조)가 원문 그대로 href 에 들어가 있었다.
 *   브라우저는 열어 주지만 구글은 ASCII 범위 밖 문자를 인코딩하라고 안내한다 (url-structure.md, 2026-10-30).
 *   이미 인코딩된 주소(%xx)는 그대로 둔다.
 */
export function toAsciiHref(url: string): string {
  return /[^\x00-\x7F]/.test(url) ? encodeURI(url) : url;
}
