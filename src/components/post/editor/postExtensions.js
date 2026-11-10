import { Extension, textblockTypeInputRule } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import Blockquote from '@tiptap/extension-blockquote'
import Heading from '@tiptap/extension-heading'
import { ListItem, OrderedList } from '@tiptap/extension-list'

import { EntityMentionCard, EntityMentionChip } from './entityMentionExtensions'

// 본문 스키마 (Specification spec/client/post-content.md) — 웹·앱·BE 공통 계약.
// 에디터와 PostContentView가 같은 목록을 써서, 허용 밖 서식은 입력도 렌더링도 되지 않게 한다

const isHttpUrl = (url) => /^https?:\/\//i.test(url)

// 중첩 목록·인용 안 목록 없음 — listItem·blockquote 안에는 paragraph만 둔다.
// heading·언급 카드는 이 두 노드 안에 들어갈 수 없어 자연히 최상위에만 남는다
const ParagraphOnlyListItem = ListItem.extend({ content: 'paragraph+' })
const ParagraphOnlyBlockquote = Blockquote.extend({ content: 'paragraph+' })

// 번호 목록은 start만 저장한다 (type attr 제거)
const StartOnlyOrderedList = OrderedList.extend({
  addAttributes() {
    // eslint-disable-next-line no-unused-vars
    const { type, ...rest } = this.parent?.() ?? {}
    return rest
  },
})

// 단축 입력은 앱과 같게 "# "→큰 소제목(h2), "## "→작은 소제목(h3).
// Tiptap 기본 규칙은 '#' 개수를 level로 써서 "## "가 h2가 되므로 대체한다
const PostHeading = Heading.extend({
  addInputRules() {
    return [
      textblockTypeInputRule({ find: /^#\s$/, type: this.type, getAttributes: { level: 2 } }),
      textblockTypeInputRule({ find: /^##\s$/, type: this.type, getAttributes: { level: 3 } }),
    ]
  },
}).configure({ levels: [2, 3] })

// 외부에서 붙여넣은 내용은 일반 텍스트로 받는다. ProseMirror가 복사한 HTML에는
// data-pm-slice가 붙으므로, 같은 에디터에서 복사한 슬라이스만 서식을 유지한다.
// pasteText는 일반 붙여넣기 흐름을 그대로 타서 줄바꿈은 문단으로, URL은 자동 링크가 된다
const PlainTextPaste = Extension.create({
  name: 'plainTextPaste',
  addProseMirrorPlugins() {
    // pasteText도 handlePaste를 다시 거치므로, 재진입한 호출은 기본 처리로 넘긴다
    let pastingText = false
    return [
      new Plugin({
        props: {
          handlePaste(view, event) {
            if (pastingText) return false
            const html = event.clipboardData?.getData('text/html')
            if (!html || html.includes('data-pm-slice')) return false
            pastingText = true
            try {
              return view.pasteText(event.clipboardData.getData('text/plain'), event)
            } finally {
              pastingText = false
            }
          },
        },
      }),
    ]
  },
})

export const postContentExtensions = [
  StarterKit.configure({
    heading: false,
    // 자동 링크만 — 링크 버튼·붙여넣기 링크 없음, href는 http·https만
    link: {
      openOnClick: false,
      linkOnPaste: false,
      autolink: true,
      isAllowedUri: isHttpUrl,
      shouldAutoLink: isHttpUrl,
    },
    italic: false,
    underline: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    listItem: false,
    blockquote: false,
    orderedList: false,
  }),
  PostHeading,
  ParagraphOnlyListItem,
  ParagraphOnlyBlockquote,
  StartOnlyOrderedList,
  EntityMentionCard,
  EntityMentionChip,
  PlainTextPaste,
]
