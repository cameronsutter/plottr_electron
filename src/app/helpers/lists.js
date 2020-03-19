import { chapter } from '../../../shared/initialState'
import { arrayId } from 'store/newIds'

export function reorderList (originalPosition, newPosition, list) {
  const sortedList = _.sortBy(list, 'position')
  const [removed] = sortedList.splice(newPosition, 1)
  sortedList.splice(originalPosition, 0, removed)
  return sortedList
}

//TODO: this will need to change
export function insertChapter (position, chapters) {
  var newId = arrayId(chapters)
  var newChapter = _.clone(chapter)
  newChapter['id'] = newId

  const sortedChapters = _.sortBy(chapters, 'position')
  sortedChapters.splice(position, 0, newChapter)
  return sortedChapters
}