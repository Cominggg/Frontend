import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'

import { postContentExtensions } from './editor/postExtensions'
import styles from './PostContentView.module.css'

// 작성 시 저장된 Tiptap JSON을 읽기 전용 에디터로 그대로 다시 렌더링한다 —
// 멘션 카드 NodeView를 작성/열람 양쪽에서 동일하게 재사용하기 위함
function PostContentView({ content }) {
  const editor = useEditor({
    extensions: postContentExtensions,
    content,
    editable: false,
  })

  // 에디터는 처음 받은 content로만 만들어지므로, 다시 조회해 본문이 바뀌면 화면도 맞춘다
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    editor.commands.setContent(content, { emitUpdate: false })
  }, [editor, content])

  if (!editor) return null

  return (
    <div className={styles.prose}>
      <EditorContent editor={editor} />
    </div>
  )
}

export default PostContentView
