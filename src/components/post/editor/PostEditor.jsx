import { forwardRef, useImperativeHandle } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'

import EditorBubbleMenu from './EditorBubbleMenu'
import MentionTag from './mentionTag'
import { countPostContentLength } from './postContentLength'
import { postContentExtensions } from './postExtensions'
import SlashCommand from './slashCommand'
import styles from './PostEditor.module.css'

const PostEditor = forwardRef(function PostEditor({ content, onChange, onCharacterCountChange }, ref) {
  const editor = useEditor({
    extensions: [
      ...postContentExtensions,
      SlashCommand,
      MentionTag,
      Placeholder.configure({
        placeholder: ({ editor: e, node }) =>
          e.isEmpty && node.type.name === 'paragraph'
            ? "'/' 로 서식을, '@' 로 공연·아티스트·음악을 태그해보세요"
            : '',
      }),
    ],
    content,
    // 글자 수는 BE 계산식으로 센다. 한도는 입력을 막지 않고 작성 화면에서 경고·제출 차단으로 다룬다
    onCreate: ({ editor: e }) => onCharacterCountChange?.(countPostContentLength(e.getJSON())),
    onUpdate: ({ editor: e }) => {
      const json = e.getJSON()
      onChange?.(json)
      onCharacterCountChange?.(countPostContentLength(json))
    },
    editorProps: {
      attributes: {
        class: styles.prose,
      },
    },
  })

  useImperativeHandle(ref, () => ({
    // 마우스로도 '/'·'@' 메뉴를 열 수 있게 커서 자리에 트리거 글자를 넣는다.
    // 트리거는 줄 맨 앞이나 공백 뒤에서만 열리므로, 글자 바로 뒤면 공백을 하나 붙인다
    insertTrigger(char) {
      if (!editor) return
      const { $from } = editor.state.selection
      const before = $from.parent.textBetween(0, $from.parentOffset, undefined, '￼')
      const needsSpace = before.length > 0 && !/\s$/.test(before)
      editor.chain().focus().insertContent(needsSpace ? ` ${char}` : char).run()
    },
  }), [editor])

  if (!editor) return null

  return (
    <>
      <EditorBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </>
  )
})

export default PostEditor
