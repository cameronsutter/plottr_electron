import { t as i18n } from 'plottr_locales'
import { createFolderBinderItem, createTextBinderItem } from '../utils'
import { selectors } from 'pltr/v2'

const { allNotesInBookSelector } = selectors

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
