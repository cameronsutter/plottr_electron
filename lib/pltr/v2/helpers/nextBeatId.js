import * as tree from '../reducers/tree'

export const nextId = (beats) =>
  Object.values(beats)
    .filter((value) => typeof value === 'object')
    .flatMap((book) => tree.nextId('id')(book))
    .reduce((maxId, id) => Math.max(id - 1, maxId), 0) + 1
