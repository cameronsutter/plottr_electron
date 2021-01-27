import i18n from 'format-message'
import { allNotesInBookSelector } from 'app/selectors/notes'
import { createFolderBinderItem, createTextBinderItem } from '../utils'

export default function exportNotes(state, documentContents) {
  const { binderItem } = createFolderBinderItem(i18n('Notes'))
  const notes = allNotesInBookSelector(state)
  notes.forEach((note) => {
    const { title, content } = note

    const { id, binderItem: noteBinderItem } = createTextBinderItem(title)
    binderItem.Children.BinderItem.push(noteBinderItem)

    documentContents[id] = {
      docTitle: i18n('Note: {title}', { title }),
      description: content,
    }
  })

  return binderItem
}
