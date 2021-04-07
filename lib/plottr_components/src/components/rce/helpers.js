import { cloneDeep } from 'lodash'
import { Editor, createEditor as createSlateEditor } from 'slate'
import { withReact } from 'slate-react'
import { rceDataRepair } from './rceDataRepair'
import { withHistory } from 'slate-history'
import { withLinks } from './LinkButton'
import { withImages } from './ImagesButton'
import { withHTML } from './withHTML'
import withNormalizer from './Normalizer'
import { withList } from './withList'
import { initialState } from 'pltr/v2'

const { RCE_INITIAL_VALUE } = initialState

export const LIST_TYPES = ['numbered-list', 'bulleted-list']
export const HEADING_TYPES = ['heading-one', 'heading-two']

export function useTextConverter(text, log) {
  let rceText = text
  if (!text || !text.length || typeof text === 'string') {
    // [{ type: 'paragraph', children: [{ text: '' }] }]
    rceText = cloneDeep(RCE_INITIAL_VALUE)
  }
  if (typeof text === 'string') {
    rceText[0].children[0].text = text
  }

  return rceDataRepair(rceText, log)
}

export function createEditor() {
  return withList(
    withNormalizer(withHTML(withImages(withLinks(withHistory(withReact(createSlateEditor()))))))
  )
}

// Gets the previous sibling node to the provided path at the same depth
Editor.previousSibling = (editor, path) => {
  if (path == null) return

  const last = path[path.length - 1]
  if (last === 0) return

  const siblingPath = [...path.slice(0, path.length - 1), last - 1]
  const siblingNode = Editor.node(editor, siblingPath)
  return siblingNode
}

// Gets the next sibling node to the provided path at the same depth
Editor.nextSibling = (editor, path) => {
  if (path == null) return
  const last = path[path.length - 1]
  const siblingPath = [...path.slice(0, path.lenght - 1), last + 1]
  // if there is no next sibling the method will throw an error
  try {
    const siblingNode = Editor.node(editor, siblingPath)
    return siblingNode
  } catch (err) {
    return null
  }
}

Editor.isInList = (editor, path) => {
  try {
    const [parent, parentPath] = Editor.parent(editor, path)
    if (LIST_TYPES.includes(parent.type)) {
      return true
    }

    return Editor.isInList(editor, parentPath)
  } catch (err) {
    return false
  }
}

Editor.parentOfType = (editor, path, { match }) => {
  try {
    const [parent, parentPath] = Editor.parent(editor, path)
    if (match(parent)) {
      return [parent, parentPath]
    }

    return Editor.parentOfType(editor, parentPath, { match })
  } catch (err) {
    return []
  }
}
