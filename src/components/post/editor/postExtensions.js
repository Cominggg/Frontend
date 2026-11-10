import StarterKit from '@tiptap/starter-kit'
import Blockquote from '@tiptap/extension-blockquote'
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

export const postContentExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
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
  ParagraphOnlyListItem,
  ParagraphOnlyBlockquote,
  StartOnlyOrderedList,
  EntityMentionCard,
  EntityMentionChip,
]
