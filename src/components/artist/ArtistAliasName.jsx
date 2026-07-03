import styles from './ArtistAliasName.module.css'

function ArtistAliasName({ name, koreanName }) {
  return (
    <>
      {name}
      {koreanName && <span className={styles.alias}> ({koreanName})</span>}
    </>
  )
}

export default ArtistAliasName
