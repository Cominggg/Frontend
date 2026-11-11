import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { createRoot } from 'react-dom/client'

import { filterFormatOptions } from './mentionSearch'
import SlashCommandMenu from './SlashCommandMenu'

const FORMAT_APPLIERS = {
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
      root.render(<SlashCommandMenu ref={menuRef} items={props.items} command={props.command} />)
      unmount = props.mount(container)
    },
    onUpdate: (props) => {
      root.render(<SlashCommandMenu ref={menuRef} items={props.items} command={props.command} />)
    },
    onKeyDown: (props) => menuRef.current?.onKeyDown(props) ?? false,
    onExit: () => {
      unmount?.()
      root?.unmount()
    },
  }
}

// '/' 메뉴 — 서식 전용. 공연·아티스트·음악 태그는 '@'(mentionTag)로 넣는다
const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        items: ({ query }) => filterFormatOptions(query),
        render: renderSlashMenu,
        command: ({ editor, range, props }) => {
          FORMAT_APPLIERS[props.format](editor.chain().focus().deleteRange(range)).run()
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
