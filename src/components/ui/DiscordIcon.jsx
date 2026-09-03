import iconBlack from '@/assets/discord/Discord-Symbol-Black.svg'
import iconWhite from '@/assets/discord/Discord-Symbol-White.svg'
import BrandIcon from './BrandIcon'

function DiscordIcon({ size = 16 }) {
  return <BrandIcon srcBlack={iconBlack} srcWhite={iconWhite} size={size} />
}

export default DiscordIcon
