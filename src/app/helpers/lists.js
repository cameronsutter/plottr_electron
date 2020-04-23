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
  const theThing = items.map((item, index) => {
    item.position = index
    return item
  })
  return theThing
}

export function nextPositionInBook (items, bookId) {
  return items
    .filter(item => item.bookId == bookId)
    .reduce((maxPosition, item) => Math.max(item.position, maxPosition), -1) + 1
}