import _ from 'lodash'

export function reorderList (originalPosition, newPosition, list) {
  // TODO: shouldn't have to do this here. It should already be sorted
  const sortedList = _.sortBy(list, 'position')
  const [removed] = sortedList.splice(newPosition, 1)
  sortedList.splice(originalPosition, 0, removed)
  return sortedList
}

export function nextPosition (arr) {
  return arr.reduce((maxPosition, item) => Math.max(item.position, maxPosition), -1) + 1
}

export function positionReset (items) {
  return items.map((item, index) => {
    item.position = index
    return item
  })
}

export function nextPositionInBook (items, bookId) {
  return items
    .filter(item => item.bookId == bookId)
    .reduce((maxPosition, item) => Math.max(item.position, maxPosition), -1) + 1
}