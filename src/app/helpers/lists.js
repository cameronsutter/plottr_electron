import { scene } from '../../../shared/initialState'
import { arrayId } from 'store/newIds'

export function reorderList (originalPosition, newPosition, list) {
  const sortedList = _.sortBy(list, 'position')
  const [removed] = sortedList.splice(newPosition, 1)
  sortedList.splice(originalPosition, 0, removed)
  return sortedList
}

//TODO: this will need to change
export function insertScene (position, scenes) {
  var newId = arrayId(scenes)
  var newScene = _.clone(scene)
  newScene['id'] = newId

  const sortedScenes = _.sortBy(scenes, 'position')
  sortedScenes.splice(position, 0, newScene)
  return sortedScenes
}