import glyphBlack from '@/assets/instagram/Instagram_Glyph_Black.svg'
import glyphWhite from '@/assets/instagram/Instagram_Glyph_White.svg'
import BrandIcon from './BrandIcon'

function InstagramIcon({ size = 20 }) {
  return <BrandIcon srcBlack={glyphBlack} srcWhite={glyphWhite} size={size} />
}

export default InstagramIcon
