import { CHANGE_CURRENT_VIEW, ADD_TAG, ADD_PLACE, ADD_CHARACTER, ADD_CARD, ADD_LINE, ADD_SCENE } from 'constants/ActionTypes'
import { MPQ } from './helpers'

const tracker = store => next => action => {

  const result = next(action)
  let state = store.getState()
  let attrs = {
    timeline_orientation: state.ui.orientation,
    version: state.file.version,
  }

  if (action.type === ADD_CARD) MPQ.push('add_card', attrs)

  return result
}

export default tracker
