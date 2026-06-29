import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import { ROUTES } from '@/constants/routes'
import { getArtistColor } from '@/utils/artistColor'
import { followArtist, unfollowArtist } from '@/services/artistApi'
import styles from './ArtistCard.module.css'

function ArtistCard({ artist }) {
  const { id, name, imageUrl, hasUpcomingConcert } = artist
  const [isFollowing, setIsFollowing] = useState(artist.isFollowing)
  const [imgFailed, setImgFailed] = useState(false)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)
  const queryClient = useQueryClient()

  const showPlaceholder = !imageUrl || imgFailed
  const [colorFrom, colorTo] = getArtistColor(name)

  const followMutation = useMutation({
    mutationFn: (following) => following ? unfollowArtist(id) : followArtist(id),
    onMutate: (following) => {
      setIsFollowing(!following)
      return { prevFollowing: following }
    },
    onError: (_err, _vars, ctx) => {
      setIsFollowing(ctx.prevFollowing)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] })
      queryClient.invalidateQueries({ queryKey: ['following-artists'] })
      queryClient.invalidateQueries({ queryKey: ['following-concerts-home'] })
    },
  })

  function handleFollow(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { openLoginModal(window.location.href); return }
    followMutation.mutate(isFollowing)
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
              loading="lazy"
              decoding="async"
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
        disabled={followMutation.isPending}
        aria-label={isFollowing ? `${name} 언팔로우` : `${name} 팔로우`}
      >
        {isFollowing ? '팔로잉' : '+ 팔로우'}
      </button>
    </article>
  )
}

export default ArtistCard
