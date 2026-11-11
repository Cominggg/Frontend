import { Extension } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import { createRoot } from 'react-dom/client'

import { extractEntityTags } from './extractEntityTags'
import { isTagQuery, searchTagSuggestions } from './mentionSearch'
import MentionTagMenu from './MentionTagMenu'

const NARROW_QUERY = '(max-width: 767px)'

// 좁은 화면에서는 커서 줄 바로 아래에 붙이되, 폭은 본문 칸 전체로 편다 (앱의 툴바 자리 패널과 같은 모양)
function fullWidthPosition(editor, container) {
  return ({ y, strategy }) => {
    const rect = editor.view.dom.getBoundingClientRect()
    Object.assign(container.style, {
      position: strategy,
      top: `${y}px`,
      left: `${rect.left + (strategy === 'fixed' ? 0 : window.scrollX)}px`,
      width: `${rect.width}px`,
    })
  }
}

function renderTagMenu(currentTags, onDismiss) {
  let root
  let container
  let unmount
  let lastQuery = ''
  const menuRef = { current: null }

  // 문서를 JSON으로 바꿔 훑는 일이라, 메뉴가 다시 그려질 때(행 hover 등)마다가 아니라 갱신마다 한 번만 한다
  const render = (props) => {
    const tags = currentTags(props.editor)
    root.render(
      <MentionTagMenu
        ref={menuRef}
        items={props.items}
        loading={props.loading}
        query={props.query}
        command={props.command}
        getTags={() => tags}
      />,
    )
  }

  return {
    onStart: (props) => {
      container = document.createElement('div')
      root = createRoot(container)
      lastQuery = props.query
      render(props)
      const narrow = window.matchMedia?.(NARROW_QUERY).matches
      unmount = props.mount(container, narrow ? { onPosition: fullWidthPosition(props.editor, container) } : undefined)
    },
    onUpdate: (props) => {
      lastQuery = props.query
      render(props)
    },
    onKeyDown: (props) => {
      // Esc는 Suggestion이 닫는다. 같은 검색어로 다시 열리지 않게 기억만 해 둔다
      if (props.event.key === 'Escape') {
        onDismiss(lastQuery)
        return true
      }
      return menuRef.current?.onKeyDown(props) ?? false
    },
    onExit: () => {
      unmount?.()
      root?.unmount()
    },
  }
}

// 본문에서 '@검색어'로 공연·아티스트·음악·트랙을 태그한다 (앱 글쓰기와 같은 규칙).
// 고르면 친 '@검색어'를 지우고 그 자리에 언급 카드를 넣는다
const MentionTag = Extension.create({
  name: 'mentionTag',

  addOptions() {
    // 공지처럼 카드를 태그로 저장하지 않는 본문은 고유 카드 10개 제한을 끈다
    return { tagLimit: true }
  },

  addProseMirrorPlugins() {
    const { tagLimit } = this.options
    const currentTags = (editor) => (tagLimit ? extractEntityTags(editor.getJSON()) : [])
    // Esc로 닫은 검색어. 한 글자라도 바뀌면 다시 연다
    let dismissedQuery = null

    return [
      Suggestion({
        editor: this.editor,
        pluginKey: new PluginKey('mentionTag'),
        char: '@',
        // 줄 맨 앞이나 공백 뒤의 @만 — 메일 주소처럼 글자 바로 뒤의 @는 무시한다
        allowedPrefixes: [' '],
        allowSpaces: true,
        debounce: 300,
        decorationClass: 'mention-tag-query',
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from)
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === 'blockquote') return false
          }
          return isTagQuery(state.doc.textBetween(range.from + 1, range.to))
        },
        shouldResetDismissed: ({ match }) => match.query !== dismissedQuery,
        items: ({ query, editor }) => {
          dismissedQuery = null
          return searchTagSuggestions(query, currentTags(editor))
        },
        render: () =>
          renderTagMenu(currentTags, (query) => {
            dismissedQuery = query
          }),
        command: ({ editor, range, props }) => {
          const mentionNode = {
            type: 'entityMentionCard',
            attrs: {
              entityType: props.type,
              entityId: props.id,
              title: props.title,
              subtitle: props.subtitle ?? null,
              thumbnailUrl: props.thumbnailUrl ?? null,
              releaseGroupId: props.releaseGroupId ?? null,
            },
          }
          // 블록 카드 뒤에 빈 문단이 없으면 커서가 카드를 선택한 채 남아, 이어 치면 카드가 지워진다
          editor.chain().focus().insertContentAt(range, [mentionNode, { type: 'paragraph' }]).run()
        },
      }),
    ]
  },
})

export default MentionTag
