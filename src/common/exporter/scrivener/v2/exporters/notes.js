import i18n from 'format-message'
import { createFolderBinderItem, createTextBinderItem } from '../utils'
import { selectors } from 'pltr/v2'

const { allNotesInBookSelector } = selectors

export default function exportNotes(state, documentContents, options) {
  const { binderItem } = createFolderBinderItem(i18n('Notes'))
  const notes = allNotesInBookSelector(state)
  notes.forEach((note) => {
    const { title, content } = note

    const { id, binderItem: noteBinderItem } = createTextBinderItem(title)
    binderItem.Children.BinderItem.push(noteBinderItem)

    documentContents[id] = {
      body: {
        docTitle: options.notes.heading ? title : null,
        description: options.notes.content ? content : null,
      },
    }
  })

  return binderItem
}
