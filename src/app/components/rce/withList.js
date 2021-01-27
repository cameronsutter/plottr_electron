import { Editor, Transforms } from 'slate'

export function withList(editor) {
  const { insertBreak, deleteBackward } = editor

  editor.insertBreak = () => {
    let parent
    try {
      parent = Editor.parent(editor, editor.selection)
    } catch (err) {}

    if (parent == null) return void insertBreak()

    // if the parent node is not a list item we want to operate normally
    const [parentNode, parentPath] = parent
    if (parentNode.type !== 'list-item') return void insertBreak()

    // only do custom insertBreak if the list item has empty text
    const [node] = Editor.node(editor, editor.selection)
    if (node.text.length > 0) return void insertBreak()

    Transforms.liftNodes(editor, {
      at: parentPath,
    })

    Transforms.setNodes(editor, {
      type: 'paragraph',
    })
  }

  editor.deleteBackward = (unit) => {
    let parent
    try {
      parent = Editor.parent(editor, editor.selection)
    } catch (err) {}

    if (parent == null) return void deleteBackward(unit)

    // if the parent node is not a list item we want to operate normally
    const [parentNode, parentPath] = parent
    if (parentNode.type !== 'list-item') return void deleteBackward(unit)

    // if the node is not empty, operate normally
    const [node] = Editor.node(editor, editor.selection)
    if (node.text.length > 0) return void deleteBackward(unit)

    Transforms.liftNodes(editor, {
      at: parentPath,
    })

    Transforms.setNodes(editor, {
      type: 'paragraph',
    })
  }

  return editor
}
