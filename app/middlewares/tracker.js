import { CHANGE_CURRENT_VIEW, ADD_TAG, ADD_PLACE, ADD_CHARACTER, ADD_CARD, ADD_LINE, ADD_SCENE } from 'constants/ActionTypes'
import { MPQ } from './helpers'

const tracker = store => next => action => {
  if (action.type === CHANGE_CURRENT_VIEW && action.view === 'outline') {
    MPQ.push('view_outline')
  }

  if (action.type === ADD_CHARACTER) MPQ.push('add_character')
  if (action.type === ADD_TAG) MPQ.push('add_tag')
  if (action.type === ADD_PLACE) MPQ.push('add_place')
  if (action.type === ADD_CARD) MPQ.push('add_card')
  if (action.type === ADD_LINE) MPQ.push('add_line')
  if (action.type === ADD_SCENE) MPQ.push('add_scene')

  return next(action)
}

export default tracker
