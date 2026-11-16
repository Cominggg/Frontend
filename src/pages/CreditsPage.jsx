import SpotifyLogo from '@/components/ui/SpotifyLogo'
import styles from './CreditsPage.module.css'

// 앱 MY > 정보 > 데이터 출처 화면과 같은 문구를 쓴다
const CREDITS = [
  {
    name: 'KOPIS',
    credit: '출처: (재)예술경영지원센터 공연예술통합전산망(www.kopis.or.kr)',
    usage: '공연 제목·일정·장소·가격·예매처, 포스터, 소개 이미지',
    href: 'https://www.kopis.or.kr',
  },
  {
    name: 'Spotify',
    logo: <SpotifyLogo width={88} />,
    usage: '앨범·싱글 제목, 커버, 발매일, 수록곡, 아티스트 사진',
    href: 'https://www.spotify.com',
  },
  {
    name: 'setlist.fm',
    usage: '공연 셋리스트 (각 공연 셋리스트에 출처 링크 표기)',
    href: 'https://www.setlist.fm/',
  },
  {
    name: 'MusicBrainz',
    usage: '아티스트 이름·별칭·외부 링크 (CC0)',
    href: 'https://musicbrainz.org',
  },
]

function CreditsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>데이터 출처</h1>
        <p className={styles.lead}>커밍은 아래 서비스의 데이터를 사용합니다.</p>
        <ul className={styles.list}>
          {CREDITS.map(({ name, logo, credit, usage, href }) => (
            <li key={name} className={styles.item}>
              <a href={href} target="_blank" rel="noopener noreferrer" className={styles.name}>
                {logo ?? name}
              </a>
              {credit && <p className={styles.credit}>{credit}</p>}
              <p className={styles.usage}>{usage}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CreditsPage
