export function sceneId (scenes) {
  return scenes.reduce((maxId, scene) => Math.max(scene.id, maxId), -1) + 1
}

export function chapterId () {
  // i'll eventually implement this
  return 0
}

export function tagId (tags) {
  return tags.reduce((maxId, tag) => Math.max(tag.id, maxId), -1) + 1
}

export function placeId (places) {
  return places.reduce((maxId, place) => Math.max(place.id, maxId), -1) + 1
}

export function characterId (characters) {
  return characters.reduce((maxId, character) => Math.max(character.id, maxId), -1) + 1
}
