import { FILE_LOADED, NEW_FILE, RESET } from '../constants/ActionTypes'
import { series as defaultSeries } from '../../../shared/initialState'
import { newFileSeries } from '../../../shared/newFileState'

export default function series (state = defaultSeries, action) {
  switch (action.type) {

    case RESET:
    case FILE_LOADED:
      return action.data.series

    case NEW_FILE:
      return newFileSeries

    default:
      return state
  }
}
