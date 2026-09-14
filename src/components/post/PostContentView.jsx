import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'

import { EntityMentionCard, EntityMentionChip } from './editor/entityMentionExtensions'
import styles from './PostContentView.module.css'

// 작성 시 저장된 Tiptap JSON을 읽기 전용 에디터로 그대로 다시 렌더링한다 —
// 멘션 카드 NodeView를 작성/열람 양쪽에서 동일하게 재사용하기 위함
function PostContentView({ content }) {
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, EntityMentionCard, EntityMentionChip],
    content,
    editable: false,
  })

  if (!editor) return null

  return (
    <div className={styles.prose}>
      <EditorContent editor={editor} />
    </div>
  )
}

export default PostContentView
