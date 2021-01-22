import {
  Editor,
  Transforms,
} from 'slate';
import { LIST_TYPES } from './helpers';

export function withList(editor) {
  const {
    insertBreak,
    deleteBackward,
    deleteFragment,
    deleteForward
  } = editor;
  
  editor.deleteForward = (...args) => {
    // when the node is empty text and the next sibling is a list of somekind
    // it removes the first list item from the list so we must undo that
    const [node, path] = Editor.node(editor, editor.selection);
    if (node.text == null || node.text.length > 0) return void deleteForward(...args);
    
    // The parent will be the paragraph tag wrapping around the text
    let parent
    try { 
      parent = Editor.parent(editor, editor.selection);
    } catch (err) {}
    if (parent == null) return void deleteForward(...args);

    // get the next sibling
    const [, parentPath] = parent;
    let nextSibling
    try {
      nextSibling = Editor.nextSibling(editor, parentPath);
    } catch (err) {}
    if (nextSibling == null) return void deleteForward(...args);
    
    // if the next sibling is a list type we want to capture the type
    const [siblingNode] = nextSibling;
    if (!LIST_TYPES.includes(siblingNode.type)) return void deleteForward(...args);
    const listType = siblingNode.type; 
    
    // then perform the delete
    deleteForward(...args);

    // wrap the node back in the same list type
    Transforms.wrapNodes(editor, {
      type: listType,
    });

    // and if there were multiple list items in the original list we need
    // to merge the new list with the old one
    try {
      nextSibling = Editor.nextSibling(editor, editor.selection)
    } catch (err) {}
    if (nextSibling == null || nextSibling[0].type != listType) return;
    Transforms.mergeNodes(editor, {
      at: nextSibling[1]
    })
  }

  editor.deleteFragment = () => {
    deleteFragment();

    // after the delete, if the cursor ends up in a list it leaves it as a paragraph
    // and not a list item
    if (Editor.isInList(editor, editor.selection)) {
      Transforms.setNodes(editor, {
        type: 'list-item',
      });
    } else {
      // after the delete there are cases where a list item is removed from the bulleted
      // list and left as a list item. We should turn it into a paragraph
      Transforms.setNodes(editor, {
        type: 'paragraph',
      })
    }
  }

  editor.insertBreak = () => {
    let parent;
    try {
      parent = Editor.parent(editor, editor.selection)
    } catch (err) {}

    if (parent == null) return void insertBreak();
  
    // if the parent node is not a list item we want to operate normally
    const [parentNode, parentPath] = parent;
    if (parentNode.type !== 'list-item') return void insertBreak();

    // only do custom insertBreak if the list item has empty text
    const [node, path] = Editor.node(editor, editor.selection);
    if (node.text.length > 0) return void insertBreak();

    Transforms.liftNodes(editor, {
      at: parentPath,
    });

    Transforms.setNodes(editor, {
      type: 'paragraph'
    })
  }

  editor.deleteBackward = (unit) => {
    let parent;
    try {
      parent = Editor.parent(editor, editor.selection)
    } catch (err) {}

    if (parent == null) return void deleteBackward(unit);

    // if the parent node is not a list item we want to operate normally
    const [parentNode, parentPath] = parent;
    if (parentNode.type !== 'list-item') return void deleteBackward(unit);


    // if the node is not empty, operate normally
    const [node] = Editor.node(editor, editor.selection);
    if (node.text.length > 0) return void deleteBackward(unit);

    Transforms.liftNodes(editor, {
      at: parentPath,
    })

    Transforms.setNodes(editor, {
      type: 'paragraph',
    });
  }

  return editor;
}
