import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { createRoot } from 'react-dom/client'

import { filterTypeOptions, parseSlashQuery, searchMentions } from './mentionSearch'
import SlashCommandMenu from './SlashCommandMenu'

const FORMAT_APPLIERS = {
  heading1: (chain) => chain.setNode('heading', { level: 1 }),
  heading2: (chain) => chain.setNode('heading', { level: 2 }),
  heading3: (chain) => chain.setNode('heading', { level: 3 }),
  bulletList: (chain) => chain.toggleBulletList(),
  orderedList: (chain) => chain.toggleOrderedList(),
  blockquote: (chain) => chain.toggleBlockquote(),
}

function renderSlashMenu() {
  let root
  let container
  let unmount
  const menuRef = { current: null }

  return {
    onStart: (props) => {
      container = document.createElement('div')
      root = createRoot(container)
      root.render(<SlashCommandMenu ref={menuRef} items={props.items} query={props.query} command={props.command} />)
      unmount = props.mount(container)
    },
    onUpdate: (props) => {
      root.render(<SlashCommandMenu ref={menuRef} items={props.items} query={props.query} command={props.command} />)
    },
    onKeyDown: (props) => menuRef.current?.onKeyDown(props) ?? false,
    onExit: () => {
      unmount?.()
      root?.unmount()
    },
  }
}

const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowSpaces: true,
        startOfLine: false,
        debounce: 200,
        items: ({ query }) => {
          const parsed = parseSlashQuery(query)
          if (parsed.stage === 'type') return filterTypeOptions(parsed.typeQuery)
          return searchMentions(parsed.type, parsed.searchTerm)
        },
        render: renderSlashMenu,
        command: ({ editor, range, props }) => {
          if (props.stage === 'format') {
            const applyFormat = FORMAT_APPLIERS[props.format]
            applyFormat(editor.chain().focus().deleteRange(range)).run()
            return
          }

          if (props.stage === 'type') {
            // range.from은 트리거 문자('/') 위치 — 그대로 두고 그 뒤의 쿼리만 교체해야
            // 슬래시 커맨드가 활성 상태를 유지한 채 2단계(검색)로 이어진다
            editor.chain().focus().insertContentAt({ from: range.from + 1, to: range.to }, `${props.label} `).run()
            return
          }

          const mentionNode = {
            type: props.type === 'ARTIST' ? 'entityMentionChip' : 'entityMentionCard',
            attrs: {
              entityType: props.type,
              entityId: props.id,
              title: props.title,
              subtitle: props.subtitle ?? null,
              thumbnailUrl: props.thumbnailUrl ?? null,
              releaseGroupId: props.releaseGroupId ?? null,
            },
          }

          // 블록 카드는 뒤에 빈 문단이 없으면 삽입 후 커서가 카드 자체를 선택한
          // 상태(NodeSelection)로 남아, 곧바로 타이핑하면 카드가 지워지고 텍스트로
          // 치환돼버린다 — 항상 빈 문단을 함께 넣어 텍스트 커서 위치를 보장한다
          const content = mentionNode.type === 'entityMentionCard'
            ? [mentionNode, { type: 'paragraph' }]
            : [mentionNode]

          editor.chain().focus().insertContentAt(range, content).run()
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export default SlashCommand
