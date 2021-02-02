import mainReducer from './main'
import { DELETE_BOOK, CLEAR_TEMPLATE_FROM_TIMELINE, RESET_TIMELINE } from '../constants/ActionTypes'
import { isSeriesSelector } from '../selectors/ui'

export default function root(state, action) {
  const isSeries = action.type.includes('@@redux') ? false : isSeriesSelector(state)
  switch (action.type) {
    case DELETE_BOOK:
      if (state.ui.currentTimeline == action.id) {
        const nextBookId = state.books.allIds.find((id) => id != action.id)
        let newState = { ...state }
        newState.ui.currentTimeline = nextBookId
        return mainReducer(newState, action)
      } else {
        return mainReducer(state, action)
      }

    case CLEAR_TEMPLATE_FROM_TIMELINE:
      // TODO: work with series timeline
      // finding chapters that will NOT be removed
      const chapterIdsToClear = state.chapters.reduce((acc, ch) => {
        if (ch.bookId != action.bookId || ch.fromTemplateId != action.templateId) {
          acc[ch.id] = true
        }
        return acc
      }, {})
      // finding lines that will NOT be removed
      const lineIdsToClear = state.lines.reduce((acc, l) => {
        if (l.bookId != action.bookId || l.fromTemplateId != action.templateId) {
          acc[l.id] = true
        }
        return acc
      }, {})
      const newClearAction = { ...action, chapterIds: chapterIdsToClear, lineIds: lineIdsToClear }
      return mainReducer(state, newClearAction)

    case RESET_TIMELINE:
      let newResetAction = { ...action, isSeries }
      if (!isSeries) {
        // finding chapters that will NOT be removed
        const chapterIdsToReset = state.chapters.reduce((acc, ch) => {
          if (ch.bookId != action.bookId) {
            acc[ch.id] = true
          }
          return acc
        }, {})
        // finding lines that will NOT be removed
        const lineIdsToReset = state.lines.reduce((acc, l) => {
          if (l.bookId != action.bookId) {
            acc[l.id] = true
          }
          return acc
        }, {})
        newResetAction = {
          ...newResetAction,
          chapterIds: chapterIdsToReset,
          lineIds: lineIdsToReset,
        }
      }
      return mainReducer(state, newResetAction)

    default:
      return mainReducer(state, action)
  }
}
