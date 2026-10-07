// KOPIS 포스터·소개 이미지는 http://www.kopis.or.kr 주소로 내려온다. https 페이지에서 그대로 쓰면
// 혼합 콘텐츠로 자동 업그레이드된 뒤 https://www → https://kopis.or.kr 리다이렉트를 한 번 더 거친다.
// 최종 주소(https://kopis.or.kr)로 바로 요청한다. 다른 주소는 그대로 둔다.
const KOPIS_HTTP_ORIGIN = /^http:\/\/(www\.)?kopis\.or\.kr\//

export function toKopisHttpsUrl(url) {
  return url?.replace(KOPIS_HTTP_ORIGIN, 'https://kopis.or.kr/')
}
