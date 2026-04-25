import { useState } from 'react'
import { Link } from 'react-router-dom'

import useAuthStore from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'
import { getArtistColor } from '@/utils/artistColor'
import styles from './ArtistCard.module.css'

function ArtistCard({ artist }) {
  const { id, name, imageUrl, hasUpcomingConcert } = artist
  const [isFollowing, setIsFollowing] = useState(artist.isFollowing)
  const [imgFailed, setImgFailed] = useState(false)
  const user = useAuthStore((s) => s.user)

  const showPlaceholder = !imageUrl || imgFailed
  const [colorFrom, colorTo] = getArtistColor(name)

  function handleFollow(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      // TODO: 로그인 모달 표시 (redirectUri: 현재 URL)
      return
    }
    setIsFollowing((prev) => !prev)
  }

  return (
    <article className={styles.card}>
      <Link to={ROUTES.ARTIST_DETAIL(id)} className={styles.cardLink}>
        <div className={styles.avatarWrap}>
          {showPlaceholder ? (
            <div
              className={styles.avatarPlaceholder}
              style={{ '--a-from': colorFrom, '--a-to': colorTo }}
            >
              <span className={styles.avatarInitial}>{name.charAt(0)}</span>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={name}
              className={styles.avatar}
              onError={() => setImgFailed(true)}
            />
          )}
          {hasUpcomingConcert && <span className={styles.comingBadge}>COMING</span>}
        </div>
        <div className={styles.info}>
          <p className={styles.name}>{name}</p>
        </div>
      </Link>
      <button
        className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
        onClick={handleFollow}
        aria-label={isFollowing ? `${name} 언팔로우` : `${name} 팔로우`}
      >
        {isFollowing ? '팔로잉' : '+ 팔로우'}
      </button>
    </article>
  )
}

export default ArtistCard
