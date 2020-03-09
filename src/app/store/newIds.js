export function sceneId (scenes) {
  return scenes.reduce((maxId, scene) => Math.max(scene.id, maxId), 0) + 1
}

export function scenePosition (scenes) {
  return scenes.reduce((maxPosition, scene) => Math.max(scene.position, maxPosition), 0) + 1
}

export function tagId (tags) {
  return tags.reduce((maxId, tag) => Math.max(tag.id, maxId), 0) + 1
}

export function placeId (places) {
  return places.reduce((maxId, place) => Math.max(place.id, maxId), 0) + 1
}

export function characterId (characters) {
  return characters.reduce((maxId, character) => Math.max(character.id, maxId), 0) + 1
}

export function cardId (cards) {
  return cards.reduce((maxId, card) => Math.max(card.id, maxId), 0) + 1
}

export function lineId (lines) {
  return lines.reduce((maxId, line) => Math.max(line.id, maxId), 0) + 1
}

export function linePosition (lines) {
  return lines.reduce((maxPosition, line) => Math.max(line.position, maxPosition), 0) + 1
}

export function noteId (notes) {
  return notes.reduce((maxId, note) => Math.max(note.id, maxId), 0) + 1
}

export function positionReset (items) {
  return items.map((item, index) => {
    item.position = index
    return item
  })
}

export function imageId (images) {
  return Object.keys(images).reduce((maxId, id) => Math.max(id, maxId), 0) + 1
}
