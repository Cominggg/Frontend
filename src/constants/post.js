export const POST_CATEGORY_LABEL = {
  REVIEW: '후기',
  INFO: '정보·제보',
  FREE: '자유',
}

export const POST_CATEGORY_COLOR = {
  REVIEW: '#7C3AED',
  INFO: '#0284C7',
  FREE: '#16A34A',
}

// 후기·정보는 엔티티 멘션 최소 1개 필수
export const CATEGORIES_REQUIRING_MENTION = ['REVIEW', 'INFO']

export const MENTION_TYPE_LABEL = {
  CONCERT: '공연',
  ARTIST: '아티스트',
  RELEASE: '음악',
}
