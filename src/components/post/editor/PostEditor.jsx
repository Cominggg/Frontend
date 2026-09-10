import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'

import { EntityMentionCard, EntityMentionChip } from './entityMentionExtensions'
import EditorBubbleMenu from './EditorBubbleMenu'
import SlashCommand from './slashCommand'
import styles from './PostEditor.module.css'

function PostEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TextStyle,
      Color,
      EntityMentionCard,
      EntityMentionChip,
      SlashCommand,
      Placeholder.configure({
        placeholder: ({ editor: e, node }) =>
          e.isEmpty && node.type.name === 'paragraph'
            ? "'/' 를 입력해 서식을 지정하거나 공연·아티스트·음악을 태그해보세요"
            : '',
      }),
    ],
    content,
    onUpdate: ({ editor: e }) => onChange?.(e.getJSON()),
    editorProps: {
      attributes: {
        class: styles.prose,
      },
    },
  })

  if (!editor) return null

  return (
    <div className={styles.wrap}>
      <EditorBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default PostEditor
