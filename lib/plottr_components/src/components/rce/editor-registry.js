import { useEffect } from 'react'

// This class keeps track of currently active slate editors in the app
// and maps them to their underlying domNode. If we need to access the
// currently active editor for doing things such as issuing undo/redo
// commands you can get the editor from the registry using a slate
// contentEditable domNode.
export class EditorRegistry {
  constructor() {
    this.editors = new Map()
  }

  register(editor, domNode) {
    this.editors.set(domNode, editor)
  }

  unRegister(editor) {
    for (const domNode in this.editors) {
      if (this.editors.get(domNode) === editor) {
        this.editors.delete(domNode)
        return
      }
    }
  }

  // from other places in the app we will just have the contentEditable
  // node and need to lookup the editor from the domNode
  getEditor(domNode) {
    return this.editors.get(domNode)
  }
}

const registry = new EditorRegistry()

export default registry

// takes an editor object and returns a function
// that must be called with the slate contentEditable
// dom node
export function useRegisterEditor(editor) {
  useEffect(() => {
    return () => {
      registry.unRegister(editor)
    }
  }, [editor])

  return (node) => {
    if (node == null) return
    registry.register(editor, node)
  }
}
