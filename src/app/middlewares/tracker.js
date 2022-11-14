import { ActionTypes, selectors } from 'pltr/v2'
import makeFileSystemAPIs from '../../api/file-system-apis'
import MPQ from '../../common/utils/MPQ'
import { shouldIgnoreAction } from './shouldIgnoreAction'

const {
  ADD_LINES_FROM_TEMPLATE,
  ADD_TEMPLATE_TO_CARD,
  ADD_CHARACTER_WITH_TEMPLATE,
  ADD_TEMPLATE_TO_CHARACTER,
  ADD_BOOK_FROM_TEMPLATE,
  ADD_CARD,
} = ActionTypes

const WHITE_LIST = [
  ADD_LINES_FROM_TEMPLATE,
  ADD_TEMPLATE_TO_CARD,
  ADD_CHARACTER_WITH_TEMPLATE,
  ADD_TEMPLATE_TO_CHARACTER,
  ADD_BOOK_FROM_TEMPLATE,
  ADD_CARD,
]

const tracker = (whenClientIsReady) => {
  const { currentUserSettings } = makeFileSystemAPIs(whenClientIsReady)

  return (store) => (next) => (action) => {
    const result = next(action)
    if (shouldIgnoreAction(action)) return result
    if (!WHITE_LIST.includes(action.type)) return result

    currentUserSettings().then((user) => {
      if (!user.payment_id) return

      const state = store.getState()
      const { present } = state
      if (present && present.ui && present.file) {
        const attrs = {
          timeline_orientation: selectors.orientationSelector(present),
          version: present.file.version,
        }

        if (action.type == ADD_LINES_FROM_TEMPLATE || action.type == ADD_BOOK_FROM_TEMPLATE) {
          MPQ.push('use_timeline_template', { ...attrs, template: action.templateData.name })
        }

        if (
          action.type == ADD_CHARACTER_WITH_TEMPLATE ||
          action.type == ADD_TEMPLATE_TO_CHARACTER
        ) {
          MPQ.push('use_character_template', { ...attrs, template: action.templateData.name })
        }

        if (action.type == ADD_TEMPLATE_TO_CARD) {
          MPQ.push('use_scene_template', { ...attrs, template: action.templateData.name })
        }

        if (action.type == ADD_CARD && action.card?.templates?.length) {
          MPQ.push('use_scene_template', { ...attrs, template: action.card.templates[0].name })
        }
      }
    })

    return result
  }
}

export default tracker
