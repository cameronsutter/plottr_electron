import { children } from '../reducers/tree'

export function reorderList(originalPosition, newPosition, list) {
  const newList = [...list]
  const [removed] = newList.splice(newPosition, 1)
  newList.splice(originalPosition, 0, removed)
  return newList
}

export function moveToAbove(sourcePosition, newPosition, list) {
  const newList = [...list]
  let targetPosition = newPosition
  if (sourcePosition < newPosition) {
    // moving it downward
    targetPosition = newPosition == 0 ? 0 : newPosition - 1
  }
  const [removed] = newList.splice(sourcePosition, 1)
  newList.splice(targetPosition, 0, removed)
  return newList
}

export function positionReset(items) {
  return items
    .filter((item) => item != null)
    .map((item, index) => {
      return {
        ...item,
        position: index,
      }
    })
}

export function nextPositionInBook(items, bookId, parent) {
  return (
    children(items[bookId], parent || null).reduce(
      (maxPosition, item) => Math.max(item.position, maxPosition),
      -1
    ) + 1
  )
}
