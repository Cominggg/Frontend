import logoBlack from '@/assets/x/logo-black.svg'
import logoWhite from '@/assets/x/logo-white.svg'
import BrandIcon from './BrandIcon'

function XIcon({ size = 20 }) {
  return <BrandIcon srcBlack={logoBlack} srcWhite={logoWhite} size={size} />
}

export default XIcon
