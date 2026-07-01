import iconBlack from '@/assets/spotify/Primary_Logo_Black_RGB.svg'
import iconWhite from '@/assets/spotify/Primary_Logo_White_RGB.svg'
import BrandIcon from './BrandIcon'

function SpotifyIcon({ size = 22 }) {
  return <BrandIcon srcBlack={iconBlack} srcWhite={iconWhite} size={size} />
}

export default SpotifyIcon
