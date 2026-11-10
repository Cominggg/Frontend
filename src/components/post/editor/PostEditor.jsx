import { EditorContent, useEditor } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'

import EditorBubbleMenu from './EditorBubbleMenu'
import { countPostContentLength } from './postContentLength'
import { postContentExtensions } from './postExtensions'
import SlashCommand from './slashCommand'
import styles from './PostEditor.module.css'

function PostEditor({ content, onChange, onCharacterCountChange }) {
  const editor = useEditor({
    extensions: [
      ...postContentExtensions,
      SlashCommand,
      Placeholder.configure({
        placeholder: ({ editor: e, node }) =>
          e.isEmpty && node.type.name === 'paragraph'
            ? "'/' 를 입력해 서식을 지정하거나 공연·아티스트·음악을 태그해보세요"
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

  if (!editor) return null

  return (
    <>
      <EditorBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </>
  )
}

export default PostEditor
