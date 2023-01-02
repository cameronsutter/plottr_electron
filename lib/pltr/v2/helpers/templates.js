import { differenceWith, isEqual } from 'lodash'

import root from '../reducers/root'
import { addLinesFromTemplate } from '../actions/lines'

export const applyTemplate = (fileState, bookId, template) => {
  const rootReducer = root({})
  const addLinesAction = addLinesFromTemplate(template.templateData)
  const withNewLines = rootReducer(fileState, addLinesAction)
  const newLines = differenceWith(withNewLines.lines, fileState.lines, isEqual)
  return withNewLines
}
