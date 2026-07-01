import iconBlack from '@/assets/apple-music/Apple_Music_Icon_blk_sm_073120.svg'
import iconWhite from '@/assets/apple-music/Apple_Music_Icon_wht_sm_073120.svg'
import BrandIcon from './BrandIcon'

function AppleMusicIcon({ size = 20 }) {
  return <BrandIcon srcBlack={iconBlack} srcWhite={iconWhite} size={size} />
}

export default AppleMusicIcon
