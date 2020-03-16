import { scene } from '../../../shared/initialState'
import { sceneId } from 'store/newIds'

export function reorderList (originalPosition, newPosition, list) {
  const sortedList = _.sortBy(list, 'position')
  const [removed] = sortedList.splice(newPosition, 1)
  sortedList.splice(originalPosition, 0, removed)
  return sortedList
}

export function insertScene (position, scenes) {
  var newId = sceneId(scenes)
  var newScene = _.clone(scene)
  newScene['id'] = newId

  const sortedScenes = _.sortBy(scenes, 'position')
  sortedScenes.splice(position, 0, newScene)
  return sortedScenes
}