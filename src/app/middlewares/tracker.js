import { ADD_LINES_FROM_TEMPLATE, ADD_CARD } from 'constants/ActionTypes'
import { MPQ } from './helpers'

const WHITE_LIST = [ADD_CARD, ADD_LINES_FROM_TEMPLATE]

const tracker = store => next => action => {
  const result = next(action)
  if (!WHITE_LIST.includes(action.type)) return result

  let state = store.getState()
  let attrs = {
    timeline_orientation: state.ui.orientation,
    version: state.file.version,
  }

  if (action.type == ADD_CARD) MPQ.push('add_card', attrs)
  if (action.type == ADD_LINES_FROM_TEMPLATE) MPQ.push('use_timeline_template', {...attrs, template: action.templateName})

  return result
}

export default tracker
