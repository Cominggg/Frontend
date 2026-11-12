import { BubbleMenu } from '@tiptap/react/menus'
import { TextSelection } from '@tiptap/pm/state'

import styles from './EditorBubbleMenu.module.css'

function shouldShow({ editor, state }) {
  const { selection } = state
  if (!(selection instanceof TextSelection) || selection.empty) return false
  return editor.isEditable
}

// 본문 스키마의 인라인 서식은 굵게·취소선뿐이다 (링크는 자동 링크만)
function EditorBubbleMenu({ editor }) {
  if (!editor) return null

  return (
    <BubbleMenu editor={editor} shouldShow={shouldShow} className={styles.menu}>
      <div className={styles.row}>
        <button
          type="button"
          className={editor.isActive('bold') ? styles.btnActive : styles.btn}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="굵게"
          aria-pressed={editor.isActive('bold')}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={editor.isActive('strike') ? styles.btnActive : styles.btn}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          aria-label="취소선"
          aria-pressed={editor.isActive('strike')}
        >
          <s>S</s>
        </button>
      </div>
    </BubbleMenu>
  )
}

export default EditorBubbleMenu
