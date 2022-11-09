import { isEqual } from 'lodash'

export const notOnFirstLine = (selection) => {
  if (!selection) return false

  const anchorIsFocus = isEqual(selection.focus, selection.anchor)
  const path = selection?.focus?.path || []
  return anchorIsFocus && path[0] !== 0
}
