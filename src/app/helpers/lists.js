import _ from 'lodash'

export function reorderList (originalPosition, newPosition, list) {
  const [removed] = list.splice(newPosition, 1)
  list.splice(originalPosition, 0, removed)
  return list
}

export function nextPosition (arr) {
  return arr.reduce((maxPosition, item) => Math.max(item.position, maxPosition), -1) + 1
}

export function positionReset (items) {
  return items.map((item, index) => {
    if (!item) return null // i have no idea how this could possibly be happening, but it is
    item.position = index
    return item
  })
}

export function nextPositionInBook (items, bookId) {
  return items
    .filter(item => item.bookId == bookId)
    .reduce((maxPosition, item) => Math.max(item.position, maxPosition), -1) + 1
}