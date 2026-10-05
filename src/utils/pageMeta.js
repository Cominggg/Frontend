// 페이지 메타(title·description·image) 문구의 단일 출처.
// 브라우저의 usePageMeta와 빌드 시 URL별 HTML을 생성하는 scripts/prerender-meta.js가 함께 쓰므로
// Node에서도 import되도록 '@/' alias 없이 상대 경로만 사용한다.
import { RELEASE_TYPE_LABEL } from '../constants/release.js'
import { formatDate } from './date.js'

// 홈은 index.html의 기본 head가 그대로 쓰이므로 index.html도 같은 값으로 맞춘다 (pageMeta.test.js가 불일치를 잡는다).
export const HOME_PAGE_META = {
  title: 'J-POP 내한일정·공연 정보 - 커밍',
  description: 'J-POP 아티스트 내한 공연 일정, 티켓팅 오픈 일정, 신보 발매 소식까지 한곳에 모은 일본 가수 내한 정보',
}

export const STATIC_PAGE_META = {
  '/concerts': {
    title: 'J-POP 내한일정 - 커밍',
    description: 'J-POP·일본 가수 내한 공연 일정 모음. 예정·진행 중인 공연을 아티스트별로 검색',
  },
  '/artists': {
    title: 'J-POP 아티스트 - 커밍',
    description: '내한 소식이 있는 J-POP 아티스트 목록. 관심 아티스트 팔로우로 새 내한 소식 받기',
  },
  '/releases': {
    title: 'J-POP 신보·발매 소식 - 커밍',
    description: 'J-POP 아티스트의 앨범·싱글 발매 소식과 발매 일정 모음',
  },
  '/calendar': {
    title: 'J-POP 내한 공연 캘린더 - 커밍',
    description: '월별 J-POP 내한 공연 일정과 티켓팅 오픈 일정을 한눈에 보는 캘린더',
  },
  '/community': {
    title: 'J-POP 커뮤니티 - 커밍',
    description: '내한 공연 후기, 티켓팅 정보, 자유 게시판 J-POP 커뮤니티',
  },
  '/terms': {
    title: '서비스 이용약관 - 커밍',
    description: '커밍 서비스 이용약관. 서비스 이용 조건과 회원의 권리·의무 안내',
  },
  '/privacy': {
    title: '개인정보처리방침 - 커밍',
    description: '커밍 개인정보처리방침. 수집하는 개인정보 항목, 이용 목적, 보관 기간 안내',
  },
}

// 화면의 ArtistAliasName과 같은 '원어명(한글명)' 표기. 한글명이 없으면 원어명만 쓴다.
function formatArtistName(name, koreanName) {
  return koreanName ? `${name}(${koreanName})` : name
}

export function buildConcertMeta(concert) {
  const artists = (concert.artists ?? []).map((a) => formatArtistName(a.name, a.koreanName)).join(', ')
  const period = concert.endDate && concert.endDate !== concert.startDate
    ? `${formatDate(concert.startDate)} ~ ${formatDate(concert.endDate)}`
    : formatDate(concert.startDate)
  return {
    title: `${concert.title} - 커밍`,
    description: [artists ? `${artists} 내한 공연` : '내한 공연', period, concert.venue, '공연 일정·티켓 정보'].filter(Boolean).join(' · '),
    image: concert.posterUrl,
  }
}

export function buildArtistMeta(artist) {
  const name = formatArtistName(artist.name, artist.koreanName)
  return {
    title: `${name} 내한 공연·프로필 - 커밍`,
    description: `${name} 내한 공연 일정, 지난 공연, 발매 음반 정보`,
    image: artist.imageUrl,
  }
}

export function buildReleaseMeta(release) {
  const artist = formatArtistName(release.artistName, release.artistKoreanName)
  const heading = [artist, RELEASE_TYPE_LABEL[release.type], `「${release.title}」`].filter(Boolean).join(' ')
  return {
    title: [release.title, artist, '커밍'].filter(Boolean).join(' - '),
    description: release.releaseDate ? `${heading} · ${formatDate(release.releaseDate)} 발매` : heading,
    image: release.coverUrl,
  }
}
