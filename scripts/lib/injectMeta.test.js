import { describe, expect, it } from 'vitest'
import { escapeHtml, injectMeta } from './injectMeta'

const TEMPLATE = `<!doctype html><html lang="ko"><head>
    <title>커밍 - 기본</title>
    <meta name="description" content="기본 설명" />
    <meta property="og:title" content="커밍 - 기본" />
    <meta property="og:description" content="기본 설명" />
    <meta property="og:url" content="https://www.comingg.com" />
    <meta name="twitter:title" content="커밍 - 기본" />
    <meta name="twitter:description" content="기본 설명" />
  </head><body><div id="root"></div></body></html>`

const META = {
  title: 'YOASOBI 내한 공연 - 커밍',
  description: 'YOASOBI · KSPO DOME · 2026.09.26',
  url: 'https://www.comingg.com/concerts/1',
  image: 'https://cdn.comingg.com/posters/1.jpg',
}

function metaContent(html, attr, key) {
  const match = html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))
  return match?.[1]
}

function countOf(html, text) {
  return html.split(text).length - 1
}

describe('escapeHtml', () => {
  it.each([
    ['&', '&amp;'],
    ['"', '&quot;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
  ])('%s이면 %s로 변환', (input, expected) => {
    expect(escapeHtml(input)).toBe(expected)
  })

  it('이미 이스케이프된 엔티티가 섞여 있어도 &를 먼저 처리해 이중 이스케이프되지 않음', () => {
    expect(escapeHtml('<a href="x">&</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;')
  })

  it('문자열이 아니면 문자열로 변환', () => {
    expect(escapeHtml(2026)).toBe('2026')
  })
})

describe('injectMeta', () => {
  it('title 태그를 치환', () => {
    const html = injectMeta(TEMPLATE, META)

    expect(html).toContain(`<title>${META.title}</title>`)
    expect(html).not.toContain('커밍 - 기본')
  })

  it.each([
    ['name', 'description', META.description],
    ['property', 'og:title', META.title],
    ['property', 'og:description', META.description],
    ['property', 'og:url', META.url],
    ['name', 'twitter:title', META.title],
    ['name', 'twitter:description', META.description],
  ])('meta %s="%s"의 content를 치환', (attr, key, expected) => {
    const html = injectMeta(TEMPLATE, META)

    expect(metaContent(html, attr, key)).toBe(expected)
    expect(countOf(html, `${attr}="${key}"`)).toBe(1)
  })

  it('템플릿에 og:image가 없으면 </head> 앞에 추가', () => {
    const html = injectMeta(TEMPLATE, META)

    expect(metaContent(html, 'property', 'og:image')).toBe(META.image)
    expect(html.indexOf('og:image')).toBeLessThan(html.indexOf('</head>'))
  })

  it('image가 없으면 og:image를 추가하지 않음', () => {
    const html = injectMeta(TEMPLATE, { ...META, image: undefined })

    expect(html).not.toContain('og:image')
  })

  it('템플릿에 og:image가 있으면 중복 생성 없이 치환', () => {
    const template = TEMPLATE.replace(
      '</head>',
      '<meta property="og:image" content="https://www.comingg.com/og.png" />\n  </head>',
    )

    const html = injectMeta(template, META)

    expect(countOf(html, 'property="og:image"')).toBe(1)
    expect(metaContent(html, 'property', 'og:image')).toBe(META.image)
  })

  it('canonical 링크를 </head> 앞에 1개 추가', () => {
    const html = injectMeta(TEMPLATE, META)

    expect(countOf(html, 'rel="canonical"')).toBe(1)
    expect(html).toContain(`<link rel="canonical" href="${META.url}" />\n  </head>`)
  })

  it('withCanonical이 false면 canonical을 추가하지 않고 나머지 메타는 치환', () => {
    const html = injectMeta(TEMPLATE, { ...META, withCanonical: false })

    expect(countOf(html, 'rel="canonical"')).toBe(0)
    expect(html).toContain(`<title>${META.title}</title>`)
    expect(metaContent(html, 'property', 'og:url')).toBe(META.url)
  })

  it('값에 따옴표·script 태그가 있으면 이스케이프해 태그가 깨지지 않음', () => {
    const html = injectMeta(TEMPLATE, {
      ...META,
      title: '"LIVE" <script>alert(1)</script>',
      description: 'A & B "투어"',
    })

    expect(html).not.toContain('<script>')
    expect(html).toContain('<title>&quot;LIVE&quot; &lt;script&gt;alert(1)&lt;/script&gt;</title>')
    expect(metaContent(html, 'property', 'og:title')).toBe('&quot;LIVE&quot; &lt;script&gt;alert(1)&lt;/script&gt;')
    expect(metaContent(html, 'name', 'description')).toBe('A &amp; B &quot;투어&quot;')
  })

  it('값에 $&·$1 같은 치환 패턴이 있어도 문자 그대로 삽입', () => {
    const html = injectMeta(TEMPLATE, {
      ...META,
      title: '$& $1 공연',
      description: "$' $` 설명",
      url: 'https://www.comingg.com/concerts/$&',
    })

    expect(html).toContain('<title>$&amp; $1 공연</title>')
    expect(metaContent(html, 'property', 'og:title')).toBe('$&amp; $1 공연')
    expect(metaContent(html, 'name', 'description')).toBe("$' $` 설명")
    expect(html).toContain('<link rel="canonical" href="https://www.comingg.com/concerts/$&amp;" />')
  })

  it('템플릿에 없어 새로 추가하는 og:image도 치환 패턴을 문자 그대로 삽입', () => {
    const html = injectMeta(TEMPLATE, { ...META, image: 'https://img.example.com/a$&b.jpg' })

    expect(metaContent(html, 'property', 'og:image')).toBe('https://img.example.com/a$&amp;b.jpg')
    expect(html.match(/<\/head>/g)).toHaveLength(1)
  })
})
