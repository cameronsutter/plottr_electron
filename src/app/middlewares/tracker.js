import { CHANGE_CURRENT_VIEW, ADD_TAG, ADD_PLACE, ADD_CHARACTER, ADD_CARD, ADD_LINE, ADD_SCENE } from 'constants/ActionTypes'
import { MPQ } from './helpers'

const tracker = store => next => action => {

  const result = next(action)
  let state = store.getState()
  let attrs = {timeline_orientation: state.ui.orientation}

  if (action.type === CHANGE_CURRENT_VIEW && action.view === 'outline') {
    MPQ.push('view_outline', attrs)
  }

  if (action.type === ADD_CHARACTER) MPQ.push('add_character', attrs)
  if (action.type === ADD_TAG) MPQ.push('add_tag', attrs)
  if (action.type === ADD_PLACE) MPQ.push('add_place', attrs)
  if (action.type === ADD_CARD) MPQ.push('add_card', attrs)
  if (action.type === ADD_LINE) MPQ.push('add_line', attrs)
  if (action.type === ADD_SCENE) MPQ.push('add_scene', attrs)

  return result
}

export default tracker
