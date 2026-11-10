import { afterEach, describe, expect, it } from 'vitest'
import { Editor } from '@tiptap/core'
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

    it('data-pm-slice가 있는 HTML이면 기본 처리로 넘김', () => {
      createEditor()

      const handled = paste(editor, '<h2 data-pm-slice="0 0 []">x</h2>', 'x')

      expect(handled).toBeFalsy()
    })
  })
})
