import { addNode, newTree } from '../../reducers/tree'
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

  return {
    ...data,
    hierarchyLevels: { ...newFileHierarchies },
    beats: migratedBeats,
  }
}
