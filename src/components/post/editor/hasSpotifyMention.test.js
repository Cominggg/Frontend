import { describe, expect, it } from 'vitest'
import { hasSpotifyMention } from './hasSpotifyMention'

function card(entityType) {
  return {
    type: 'entityMentionCard',
    attrs: {
      entityType,
      entityId: 1,
      title: 'YOASOBI',
      subtitle: null,
      thumbnailUrl: null,
      releaseGroupId: null,
    },
  }
}

function doc(...content) {
  return { type: 'doc', content }
}

const paragraph = { type: 'paragraph', content: [{ type: 'text', text: '내한 공연 후기' }] }

describe('hasSpotifyMention', () => {
  it.each([
    ['아티스트', 'ARTIST'],
    ['앨범', 'RELEASE'],
    ['트랙', 'TRACK'],
  ])('%s 카드가 있으면 true', (_, entityType) => {
    expect(hasSpotifyMention(doc(paragraph, card(entityType)))).toBe(true)
  })

  it('공연 카드만 있으면 false', () => {
    expect(hasSpotifyMention(doc(paragraph, card('CONCERT')))).toBe(false)
  })

  it('카드 없는 문단만 있으면 false', () => {
    expect(hasSpotifyMention(doc(paragraph))).toBe(false)
  })

  it.each([null, undefined])('%s이면 false', (input) => {
    expect(hasSpotifyMention(input)).toBe(false)
  })

  it('중첩된 노드 안에 카드가 있으면 true', () => {
    const nested = doc({ type: 'blockquote', content: [{ type: 'paragraph', content: [card('TRACK')] }] })

    expect(hasSpotifyMention(nested)).toBe(true)
  })

  it('언급 카드가 아닌 노드에 entityType이 있으면 false', () => {
    const node = doc({ type: 'paragraph', content: [{ type: 'mentionTag', attrs: { entityType: 'ARTIST' } }] })

    expect(hasSpotifyMention(node)).toBe(false)
  })
})
