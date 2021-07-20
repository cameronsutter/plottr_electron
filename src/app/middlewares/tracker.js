import { ActionTypes } from 'pltr/v2'
import MPQ from '../../common/utils/MPQ'
import USER from '../../common/utils/user_info'
import { shouldIgnoreAction } from './shouldIgnoreAction'

const { ADD_LINES_FROM_TEMPLATE, ADD_CARD } = ActionTypes

const WHITE_LIST = [ADD_LINES_FROM_TEMPLATE]

const tracker = (store) => (next) => (action) => {
  const result = next(action)
  if (shouldIgnoreAction(action)) return result
  if (!WHITE_LIST.includes(action.type)) return result
  if (!USER.get('payment_id')) return result

  const state = store.getState()
  if (state && state.ui && state.file) {
    const attrs = {
      timeline_orientation: state.ui.orientation,
      version: state.file.version,
    }

    if (action.type == ADD_LINES_FROM_TEMPLATE)
      MPQ.push('use_timeline_template', { ...attrs, template: action.templateData.name })
  }

  return result
}

export default tracker
