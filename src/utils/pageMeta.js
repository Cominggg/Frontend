// 페이지 메타(title·description·image) 문구의 단일 출처.
// 브라우저의 usePageMeta와 빌드 시 URL별 HTML을 생성하는 scripts/prerender-meta.js가 함께 쓰므로
// Node에서도 import되도록 '@/' alias 없이 상대 경로만 사용한다.
import { formatDate } from './date.js'

export const STATIC_PAGE_META = {
  '/concerts': {
    title: 'Jpop 내한일정 - 커밍',
    description: 'Jpop 아티스트의 내한일정과 공연 정보를 한 곳에서 확인하세요. 예정·진행 중인 공연을 상태·아티스트별로 필터링할 수 있습니다.',
  },
  '/artists': {
    title: '아티스트 - 커밍',
    description: '내한 소식이 있는 Jpop 아티스트를 한눈에 확인하고, 관심 아티스트를 팔로우해 새 소식을 받아보세요.',
  },
  '/releases': {
    title: '음악 - 커밍',
    description: 'Jpop 아티스트의 신보·싱글 발매 소식을 모아봤습니다. 앨범·싱글 종류별로 필터링해 확인하세요.',
  },
  '/calendar': {
    title: '캘린더 - 커밍',
    description: '월별 캘린더에서 Jpop 아티스트의 공연 일정을 한눈에 확인하고 내 캘린더에 담아보세요.',
  },
  '/community': {
    title: '커뮤니티 - 커밍',
    description: '자유, 정보, 공연 후기 이야기를 나누는 Jpop 팬 커뮤니티입니다.',
  },
  '/terms': {
    title: '서비스 이용약관 - 커밍',
    description: '커밍 서비스 이용약관입니다. 서비스 이용 조건과 회원의 권리·의무를 안내합니다.',
  },
  '/privacy': {
    title: '개인정보처리방침 - 커밍',
    description: '커밍 개인정보처리방침입니다. 수집하는 개인정보 항목과 이용 목적, 보관 기간을 안내합니다.',
  },
}

export function buildConcertMeta(concert) {
  return {
    title: `${concert.title} - 커밍`,
    description: `${(concert.artists ?? []).map((a) => a.name).join(' · ')} · ${concert.venue} · ${formatDate(concert.startDate)}`,
    image: concert.posterUrl,
  }
}

export function buildArtistMeta(artist) {
  return {
    title: `${artist.name} - 커밍`,
    description: `${artist.name} 아티스트 프로필 및 내한 공연 정보`,
    image: artist.imageUrl,
  }
}

export function buildReleaseMeta(release) {
  return {
    title: `${release.title} - 커밍`,
    description: `${release.artistName} · ${release.title} 발매 정보`,
    image: release.coverUrl,
  }
}
