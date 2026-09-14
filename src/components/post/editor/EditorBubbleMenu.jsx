import { BubbleMenu } from '@tiptap/react/menus'
import { TextSelection } from '@tiptap/pm/state'
import { useCallback, useEffect, useState } from 'react'

import { TEXT_COLORS } from './textColors'
import styles from './EditorBubbleMenu.module.css'

function shouldShow({ editor, state }) {
  const { selection } = state
  if (!(selection instanceof TextSelection) || selection.empty) return false
  return editor.isEditable
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function EditorBubbleMenu({ editor }) {
  const [mode, setMode] = useState('menu')
  const [linkUrl, setLinkUrl] = useState('')

  // 새로운 선택 영역이 잡힐 때마다 링크 입력/색상 팔레트를 닫아 기본 메뉴로 되돌린다
  useEffect(() => {
    if (!editor) return undefined
    const resetMode = () => setMode('menu')
    editor.on('selectionUpdate', resetMode)
    return () => editor.off('selectionUpdate', resetMode)
  }, [editor])

  const openLinkEditor = useCallback(() => {
    setLinkUrl(editor.getAttributes('link').href ?? '')
    setMode('link')
  }, [editor])

  const applyLink = useCallback(
    (e) => {
      e.preventDefault()
      const url = linkUrl.trim()
      const chain = editor.chain().focus().extendMarkRange('link')
      if (url) chain.setLink({ href: url })
      else chain.unsetLink()
      chain.run()
      setMode('menu')
    },
    [editor, linkUrl],
  )

  const applyColor = useCallback(
    (value) => {
      const chain = editor.chain().focus()
      if (value) chain.setColor(value)
      else chain.unsetColor()
      chain.run()
      setMode('menu')
    },
    [editor],
  )

  if (!editor) return null

  return (
    <BubbleMenu editor={editor} shouldShow={shouldShow} className={styles.menu}>
      {mode === 'link' && (
        <form className={styles.linkForm} onSubmit={applyLink}>
          <input
            autoFocus
            className={styles.linkInput}
            type="text"
            inputMode="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setMode('menu')
            }}
          />
          <button type="submit" className={styles.linkConfirm}>
            적용
          </button>
        </form>
      )}

      {mode === 'color' && (
        <div className={styles.colorRow}>
          {TEXT_COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              className={c.value ? styles.colorSwatch : styles.colorSwatchDefault}
              style={c.value ? { backgroundColor: c.value } : undefined}
              aria-label={c.name}
              onClick={() => applyColor(c.value)}
            />
          ))}
        </div>
      )}

      {mode === 'menu' && (
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
            className={editor.isActive('italic') ? styles.btnActive : styles.btn}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="기울임"
            aria-pressed={editor.isActive('italic')}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={editor.isActive('link') ? styles.btnActive : styles.btn}
            onClick={openLinkEditor}
            aria-label="링크"
            aria-pressed={editor.isActive('link')}
          >
            <LinkIcon />
          </button>
          <button type="button" className={styles.btn} onClick={() => setMode('color')} aria-label="글자 색상">
            <span
              className={styles.colorGlyph}
              style={{ color: editor.getAttributes('textStyle').color || undefined }}
            >
              A
            </span>
          </button>
        </div>
      )}
    </BubbleMenu>
  )
}

export default EditorBubbleMenu
