import { useState } from 'react'
import { Link } from 'react-router-dom'

import useAuthStore from '@/stores/authStore'
import { ROUTES } from '@/constants/routes'
import styles from './ArtistCard.module.css'

const PLACEHOLDER_PALETTE = [
  ['#7c3aed', '#c4b5fd'],
  ['#0369a1', '#7dd3fc'],
  ['#be123c', '#fda4af'],
  ['#15803d', '#86efac'],
  ['#b45309', '#fcd34d'],
  ['#0f766e', '#5eead4'],
  ['#9333ea', '#d8b4fe'],
  ['#1d4ed8', '#93c5fd'],
]

function getArtistColor(name) {
  const safeName = typeof name === 'string' ? name : ''
  let hash = 0
  for (let i = 0; i < safeName.length; i++) {
    hash = (hash * 31 + safeName.charCodeAt(i)) | 0
  }
  return PLACEHOLDER_PALETTE[Math.abs(hash) % PLACEHOLDER_PALETTE.length]
}

function ArtistCard({ artist }) {
  const { id, name, imageUrl, genres, hasUpcomingConcert } = artist
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
          {genres.length > 0 && (
            <div className={styles.genres}>
              {genres.slice(0, 2).map((g) => (
                <span key={g} className={styles.genreChip}>{g}</span>
              ))}
            </div>
          )}
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
