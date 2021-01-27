import { Transforms } from 'slate'
import { convertHTMLString } from '../../../common/slate_serializers/from_html'

export const withHTML = (editor) => {
  const { insertData } = editor

  editor.insertData = (data) => {
    const html = data.getData('text/html')

    if (html) {
      Transforms.insertNodes(editor, convertHTMLString(html))
    } else {
      insertData(data)
    }
  }

  return editor
}
