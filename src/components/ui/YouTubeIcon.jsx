import iconBlack from '@/assets/youtube/yt_icon_almostblack_digital.png'
import iconWhite from '@/assets/youtube/yt_icon_white_digital.png'
import BrandIcon from './BrandIcon'

function YouTubeIcon({ size = 20 }) {
  return <BrandIcon srcBlack={iconBlack} srcWhite={iconWhite} size={size} objectFit="contain" />
}

export default YouTubeIcon
