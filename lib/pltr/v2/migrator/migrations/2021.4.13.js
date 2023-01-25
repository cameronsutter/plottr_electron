import { addNode, newTree } from '../../reducers/tree'
import { hierarchyLevel } from '../../store/initialState'

// Note: the schema of hierarchies changed.  So we need to lock this
// older schema in place for this migration.
export const newFileHierarchies = { 0: hierarchyLevel }

export default function migrate(data) {
  if (data.file && data.file.version === '2021.4.13') return data
  if (data.beats.length !== undefined && data.hierarchyLevels !== undefined) return data

  const addToBeatTree = addNode('id')

  // Some templates do not have books
  const allBookIds =
    data.books && data.books.allIds
      ? ['series', ...data.books.allIds]
      : data.beats.map(({ bookId }) => bookId)

  const migratedBeats = data.beats.length
    ? allBookIds.reduce((newBeats, nextBook, index) => {
        const nextBookId = parseInt(nextBook) || 'series'
        const tree = newTree('id')

        return {
          ...newBeats,
          [nextBookId]: data.beats
            .filter(({ bookId }) => bookId === nextBookId)
            .reduce((tree, beat) => {
              return addToBeatTree(tree, null, {
                ...beat,
                expanded: true,
              })
            }, tree),
        }
      }, {})
    : data.beats

  return {
    ...data,
    hierarchyLevels: data.hierarchyLevels || newFileHierarchies,
    beats: migratedBeats,
  }
}
