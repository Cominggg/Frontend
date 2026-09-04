import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import ArtistAliasName from '@/components/artist/ArtistAliasName'
import SpotifyIcon from '@/components/ui/SpotifyIcon'
import useAuthStore from '@/stores/authStore'
import useLoginModalStore from '@/stores/loginModalStore'
import { ROUTES } from '@/constants/routes'
import { getArtistColor } from '@/utils/artistColor'
import { followArtist, unfollowArtist } from '@/services/artistApi'
import styles from './ArtistCard.module.css'

function ArtistCard({ artist }) {
  const { id, name, koreanName, imageUrl, hasUpcomingConcert, spotifyUrl, followerCount } = artist
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
    if (!user) { openLoginModal(window.location.pathname + window.location.search); return }
    followMutation.mutate(isFollowing)
  }

  return (
    <article className={styles.card}>
      <div className={styles.avatarWrap}>
        <Link to={ROUTES.ARTIST_DETAIL(id)} tabIndex={-1} aria-hidden="true">
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
        </Link>
        {hasUpcomingConcert && <span className={styles.comingBadge}>COMING</span>}
        {spotifyUrl && (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.spotifyBadge}
            aria-label={`${name} Spotify에서 듣기`}
          >
            <SpotifyIcon size={22} />
          </a>
        )}
      </div>
      <Link to={ROUTES.ARTIST_DETAIL(id)} className={styles.info}>
        <p className={styles.name}><ArtistAliasName name={name} koreanName={koreanName} /></p>
        {followerCount != null && (
          <p className={styles.followerCount}>팔로워 {followerCount.toLocaleString()}</p>
        )}
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
