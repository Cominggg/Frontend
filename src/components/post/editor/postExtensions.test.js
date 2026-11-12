import { afterEach, describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
import { DOMParser } from '@tiptap/pm/model'
import { __parseFromClipboard as parseFromClipboard } from '@tiptap/pm/view'
import { postContentExtensions } from './postExtensions'

let editor

function createEditor(content = '') {
  editor = new Editor({ extensions: postContentExtensions, content })
  return editor
}

function typeIn(target, value) {
  for (const ch of value) {
    const { from, to } = target.state.selection
    const handled = target.view.someProp('handleTextInput', (f) => f(target.view, from, to, ch))
    if (!handled) target.view.dispatch(target.state.tr.insertText(ch, from, to))
  }
}

const pasteEvent = (html, plain) => ({
  clipboardData: { getData: (key) => (key === 'text/html' ? html : plain) },
  preventDefault() {},
})

function paste(target, html, plain) {
  return target.view.someProp('handlePaste', (f) => f(target.view, pasteEvent(html, plain), null))
}

afterEach(() => {
  editor?.destroy()
  editor = undefined
})

describe('postContentExtensions', () => {
  describe('스키마', () => {
    it('허용된 노드만 포함', () => {
      createEditor()

      expect(Object.keys(editor.schema.nodes).sort()).toEqual(
        [
          'doc',
          'paragraph',
          'text',
          'hardBreak',
          'heading',
          'bulletList',
          'orderedList',
          'listItem',
          'blockquote',
          'entityMentionCard',
        ].sort(),
      )
    })

    it('허용된 마크만 포함', () => {
      createEditor()

      expect(Object.keys(editor.schema.marks).sort()).toEqual(['bold', 'link', 'strike'])
    })
  })

  describe('소제목', () => {
    it.each(['h1', 'h4'])('<%s>이면 paragraph로 변환', (tag) => {
      createEditor(`<${tag}>제목</${tag}>`)

      expect(editor.getJSON().content).toEqual([{ type: 'paragraph', content: [{ type: 'text', text: '제목' }] }])
    })

    it.each([
      ['h2', 2],
      ['h3', 3],
    ])('<%s>이면 heading level %i', (tag, level) => {
      createEditor(`<${tag}>제목</${tag}>`)

      expect(editor.getJSON().content).toEqual([
        { type: 'heading', attrs: { level }, content: [{ type: 'text', text: '제목' }] },
      ])
    })
  })

  it.each(['em', 'code'])('<%s> 마크는 제거되고 텍스트만 남음', (tag) => {
    createEditor(`<p><${tag}>YOASOBI</${tag}></p>`)

    expect(editor.getJSON().content).toEqual([{ type: 'paragraph', content: [{ type: 'text', text: 'YOASOBI' }] }])
  })

  it('중첩 목록이면 listItem 안에 paragraph만 남음', () => {
    createEditor('<ul><li><p>a</p><ul><li>b</li></ul></li></ul>')

    const listItems = editor.getJSON().content.flatMap((node) => (node.type === 'bulletList' ? node.content : []))
    expect(listItems.length).toBeGreaterThan(0)
    listItems.forEach((item) => {
      item.content.forEach((child) => expect(child.type).toBe('paragraph'))
    })
  })

  it('목록 안에서 Tab을 눌러도 오류 없이 중첩 목록이 생기지 않음', () => {
    createEditor('<ul><li><p>a</p></li><li><p>b</p></li></ul>')
    editor.commands.setTextSelection(9)
    const before = editor.getJSON()

    const handled = editor.view.someProp('handleKeyDown', (f) =>
      f(editor.view, new KeyboardEvent('keydown', { key: 'Tab' })),
    )

    expect(handled).toBe(true)
    expect(editor.getJSON()).toEqual(before)
  })

  it('blockquote 안 소제목·목록은 paragraph만 남음', () => {
    createEditor('<blockquote><h2>a</h2><ul><li>b</li></ul><p>c</p></blockquote>')

    const blockquotes = editor.getJSON().content.filter((node) => node.type === 'blockquote')
    expect(blockquotes.length).toBeGreaterThan(0)
    blockquotes.forEach((quote) => {
      quote.content.forEach((child) => expect(child.type).toBe('paragraph'))
    })
  })

  it('<ol type start>이면 orderedList attrs는 start만', () => {
    createEditor('<ol type="a" start="3"><li><p>a</p></li></ol>')

    expect(editor.getJSON().content[0]).toMatchObject({ type: 'orderedList' })
    expect(editor.getJSON().content[0].attrs).toEqual({ start: 3 })
  })

  describe('링크', () => {
    it('javascript: href면 link 마크 없음', () => {
      createEditor('<p><a href="javascript:x">링크</a></p>')

      expect(editor.getJSON().content).toEqual([{ type: 'paragraph', content: [{ type: 'text', text: '링크' }] }])
    })

    it('https href면 link 마크의 href 유지', () => {
      createEditor('<p><a href="https://a.com">링크</a></p>')

      const [textNode] = editor.getJSON().content[0].content
      expect(textNode.marks).toEqual([expect.objectContaining({ type: 'link', attrs: expect.objectContaining({ href: 'https://a.com' }) })])
    })
  })

  describe('단축 입력', () => {
    it.each([
      ['# ', 2],
      ['## ', 3],
    ])('"%s" 입력하면 heading level %i', (input, level) => {
      createEditor()

      typeIn(editor, input)

      // 뒤의 빈 문단은 StarterKit TrailingNode가 붙인 것
      expect(editor.getJSON().content[0]).toEqual({ type: 'heading', attrs: { level } })
    })

    it('"### " 입력하면 paragraph 유지', () => {
      createEditor()

      typeIn(editor, '### ')

      expect(editor.getJSON().content).toEqual([{ type: 'paragraph', content: [{ type: 'text', text: '### ' }] }])
    })
  })

  describe('붙여넣기', () => {
    it('외부 HTML이면 일반 텍스트로 붙여넣고 URL은 자동 링크', () => {
      createEditor()

      paste(editor, '<h2><em>x</em></h2><p>https://a.com y</p>', 'x\nhttps://a.com y')

      const content = editor.getJSON().content
      expect(content).toHaveLength(2)
      expect(content[0]).toEqual({ type: 'paragraph', content: [{ type: 'text', text: 'x' }] })
      expect(content[1].type).toBe('paragraph')
      expect(content[1].content).toContainEqual(
        expect.objectContaining({
          text: 'https://a.com',
          marks: [expect.objectContaining({ type: 'link', attrs: expect.objectContaining({ href: 'https://a.com' }) })],
        }),
      )
    })

    // 실제 복사처럼 에디터가 슬라이스를 직렬화(transformCopied 포함)하고, 붙여넣을 때처럼 HTML을 다시 파싱한다
    function copyAll(target) {
      const { state } = target
      const slice = state.doc.slice(0, state.doc.content.size)
      const { dom, text } = target.view.serializeForClipboard(slice)
      return { html: dom.innerHTML, text }
    }

    function pasteParsed(target, html, plain) {
      const slice = parseFromClipboard(target.view, plain, html, false, target.state.selection.$from)
      return target.view.someProp('handlePaste', (f) => f(target.view, pasteEvent(html, plain), slice))
    }

    const FORMATTED_DOC = {
      type: 'doc',
      content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '소제목' }] }],
    }

    it('이 에디터에서 복사한 내용이면 기본 처리로 넘겨 서식 유지', () => {
      createEditor(FORMATTED_DOC)
      const { html, text } = copyAll(editor)

      expect(html).toContain('data-pm-slice')
      expect(pasteParsed(editor, html, text)).toBeFalsy()
    })

    it('다른 ProseMirror 에디터에서 복사한 내용이면 data-pm-slice가 있어도 일반 텍스트로 붙여넣음', () => {
      const other = new Editor({ extensions: postContentExtensions, content: FORMATTED_DOC })
      const { html, text } = copyAll(other)
      other.destroy()
      createEditor()

      expect(pasteParsed(editor, html, text)).toBe(true)
      expect(editor.getJSON().content).toEqual([{ type: 'paragraph', content: [{ type: 'text', text: '소제목' }] }])
    })

    it('text/plain 없이 HTML만 오면 HTML의 글자만 일반 텍스트로 붙여넣음', () => {
      createEditor()

      const handled = paste(editor, '<h2><strong>굵은 소제목</strong></h2>', '')

      expect(handled).toBe(true)
      expect(editor.getJSON().content).toEqual([{ type: 'paragraph', content: [{ type: 'text', text: '굵은 소제목' }] }])
    })

    it('HTML에 글자가 하나도 없으면 아무것도 넣지 않고 처리 완료', () => {
      createEditor()

      expect(paste(editor, '<img src="x">', '')).toBe(true)
      expect(editor.isEmpty).toBe(true)
    })
  })
  describe('언급 카드 HTML 왕복', () => {
    function roundTripCardAttrs(attrs) {
      createEditor({ type: 'doc', content: [{ type: 'entityMentionCard', attrs }] })
      const div = document.createElement('div')
      div.innerHTML = editor.getHTML()

      const doc = DOMParser.fromSchema(editor.schema).parse(div).toJSON()
      return doc.content.find((node) => node.type === 'entityMentionCard').attrs
    }

    it('숫자 모양 title·subtitle이면 문자열 유지, entityId는 숫자 유지', () => {
      const attrs = roundTripCardAttrs({
        entityType: 'RELEASE',
        entityId: 5,
        title: '1989',
        subtitle: '2024',
        thumbnailUrl: null,
        releaseGroupId: null,
      })

      expect(attrs).toMatchObject({ entityType: 'RELEASE', entityId: 5, title: '1989', subtitle: '2024' })
    })

    it('TRACK 카드면 releaseGroupId는 숫자, thumbnailUrl은 문자열로 복원', () => {
      const attrs = roundTripCardAttrs({
        entityType: 'TRACK',
        entityId: 7,
        title: '夜に駆ける',
        subtitle: 'YOASOBI',
        thumbnailUrl: 'https://img/1.jpg',
        releaseGroupId: 42,
      })

      expect(attrs).toMatchObject({ entityType: 'TRACK', entityId: 7, releaseGroupId: 42, thumbnailUrl: 'https://img/1.jpg' })
    })

    it('subtitle·thumbnailUrl·releaseGroupId가 null이면 null 유지', () => {
      const attrs = roundTripCardAttrs({
        entityType: 'ARTIST',
        entityId: 1,
        title: 'YOASOBI',
        subtitle: null,
        thumbnailUrl: null,
        releaseGroupId: null,
      })

      expect(attrs).toMatchObject({ subtitle: null, thumbnailUrl: null, releaseGroupId: null })
    })
  })
})
