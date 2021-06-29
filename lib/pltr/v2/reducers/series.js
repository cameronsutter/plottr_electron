import { FILE_LOADED, NEW_FILE, RESET, EDIT_SERIES, LOAD_SERIES } from '../constants/ActionTypes'
import { series as defaultSeries } from '../store/initialState'
import { newFileSeries } from '../store/newFileState'

const series =
  (dataRepairers) =>
  (state = defaultSeries, action) => {
    switch (action.type) {
      case EDIT_SERIES:
        return {
          ...state,
          ...action.attributes,
        }

      case RESET:
      case FILE_LOADED:
        return action.data.series

      case NEW_FILE:
        return newFileSeries

      case LOAD_SERIES:
        return action.series

      default:
        return state
    }
  }

export default series
