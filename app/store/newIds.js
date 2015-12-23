export function sceneId (scenes) {
  return scenes.reduce((maxId, scene) => Math.max(scene.id, maxId), -1) + 1
}

export function chapterId () {
  // i'll eventually implement this
  return 0
}
