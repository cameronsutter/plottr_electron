import { nextColor } from '../../store/lineColors'
import { addNode, newTree } from '../../reducers/tree'
import { nextBorderStyle } from '../../store/borderStyle'
import { beat } from '../../store/initialState'
import { newFileHierarchies } from '../../store/newFileState'

export default function migrate(data) {
  if (data.file && data.file.version === '2021.3.1') return data
  if (data.beats.length !== undefined && data.hierarchyLevels !== undefined) return data

  const maxBeatId =
    data.beats.length && data.beats.reduce((maxId, { id }) => Math.max(maxId, id), -1)
  const addToBeatTree = addNode('id')

  // Some templates do not have books
  const allBookIds =
    data.books && data.books.allIds
      ? ['series', ...data.books.allIds]
      : data.beats.map(({ bookId }) => bookId)

  const migratedBeats = data.beats.length
    ? allBookIds.reduce((newBeats, nextBook, index) => {
        const nextBookId = parseInt(nextBook) || 'series'
        const parentId = maxBeatId + index + 1
        const tree = newTree('id', {
          ...beat,
          id: parentId,
          bookId: nextBookId,
        })

        return {
          ...newBeats,
          [nextBookId]: data.beats
            .filter(({ bookId }) => bookId === nextBookId)
            .reduce((tree, beat) => {
              return addToBeatTree(tree, parentId, {
                ...beat,
                expanded: true,
              })
            }, tree),
        }
      }, {})
    : data.beats

  const secondHierarchyLevel = {
    name: 'Act',
    level: 1,
    autoNumber: true,
    textColor: nextColor(1),
    textSize: 24,
    borderColor: nextColor(1),
    borderStyle: nextBorderStyle(1),
    backgroundColor: '#f1f5f8', // Same as app canvas
  }

  return {
    ...data,
    hierarchyLevels: { ...newFileHierarchies, 1: secondHierarchyLevel },
    beats: migratedBeats,
  }
}
