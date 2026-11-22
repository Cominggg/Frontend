import logoBlack from '@/assets/spotify/Full_Logo_Black_RGB.svg'
import logoWhite from '@/assets/spotify/Full_Logo_White_RGB.svg'
import BrandIcon from './BrandIcon'

// Spotify 콘텐츠 출처 표기용 전체 로고. 디자인 가이드 최소 너비는 70px이다.
function SpotifyLogo({ width = 80 }) {
  return <BrandIcon srcBlack={logoBlack} srcWhite={logoWhite} size={width} height="auto" alt="Spotify" />
}

export default SpotifyLogo
