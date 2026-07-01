import logoBlack from '@/assets/x/logo-black.png'
import logoWhite from '@/assets/x/logo-white.png'
import BrandIcon from './BrandIcon'

function XIcon({ size = 20 }) {
  return <BrandIcon srcBlack={logoBlack} srcWhite={logoWhite} size={size} />
}

export default XIcon
