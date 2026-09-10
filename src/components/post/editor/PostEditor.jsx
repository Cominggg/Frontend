import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { EntityMentionCard, EntityMentionChip } from './entityMentionExtensions'
import SlashCommand from './slashCommand'
import styles from './PostEditor.module.css'

function PostEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit, EntityMentionCard, EntityMentionChip, SlashCommand],
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
      <div className={styles.toolbar}>
        <button
          type="button"
          className={editor.isActive('bold') ? styles.toolBtnActive : styles.toolBtn}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="굵게"
          aria-pressed={editor.isActive('bold')}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={editor.isActive('italic') ? styles.toolBtnActive : styles.toolBtn}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="기울임"
          aria-pressed={editor.isActive('italic')}
        >
          <em>I</em>
        </button>
        <span className={styles.hint}>/ 를 입력해 공연·아티스트·음악을 태그해보세요</span>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export default PostEditor
