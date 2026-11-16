// Spotify 이미지(아티스트 사진·앨범 커버)를 보이는 언급 카드 종류. 공연 카드는 KOPIS 포스터라 제외한다.
export const SPOTIFY_MENTION_TYPES = ['ARTIST', 'RELEASE', 'TRACK']

// 본문 Tiptap JSON에 Spotify 데이터를 보이는 언급 카드가 하나라도 있는지
export function hasSpotifyMention(node) {
  if (!node) return false
  if (node.type === 'entityMentionCard' && SPOTIFY_MENTION_TYPES.includes(node.attrs?.entityType)) return true
  return node.content?.some(hasSpotifyMention) ?? false
}
