export function objectId(allIds) {
  if (!allIds.length) return 1
  return Math.max(...allIds) + 1
}

export function nextId(arr) {
  return arr.reduce((maxId, item) => Math.max(item.id, maxId), 0) + 1
}

// TODO: when you change images to have an allIds key, use the objectId function above
export function imageId(images) {
  return Object.keys(images).reduce((maxId, id) => Math.max(id, maxId), 0) + 1
}
