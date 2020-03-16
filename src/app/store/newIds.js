export function objectId (allIds) {
  if (!allIds.length) return 1
  return Math.max(...allIds) + 1
}

export function arrayId (arr) {
  return arr.reduce((maxId, item) => Math.max(item.id, maxId), 0) + 1
}

export function objectPosition (obj) {
  return obj.allIds.reduce((maxPosition, id) => Math.max(obj[id].position, maxPosition), 0) + 1
}

export function arrayPosition (arr) {
  return arr.reduce((maxPosition, item) => Math.max(item.position, maxPosition), 0) + 1
}

export function objectPositionReset (obj) {
  // ?
}

export function arrayPositionReset (items) {
  return items.map((item, index) => {
    item.position = index
    return item
  })
}

// TODO: when you change images to have an allIds key, use the objectId function above
export function imageId (images) {
  return Object.keys(images).reduce((maxId, id) => Math.max(id, maxId), 0) + 1
}
