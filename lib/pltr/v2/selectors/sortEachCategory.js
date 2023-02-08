import { sortBy } from 'lodash'

export function sortEachCategory(visibleByCategory, sort) {
  const sortOperands = sort.split('~')
  const attrName = sortOperands[0]
  const attrExtractor = attrName === 'last edited' ? 'lastEdited' : attrName
  const direction = sortOperands[1]
  const sortByOperand = attrName === 'name' ? [attrExtractor, 'id'] : [attrExtractor, 'name']

  Object.keys(visibleByCategory).forEach((k) => {
    const notes = visibleByCategory[k]

    const sorted = sortBy(notes, sortByOperand)
    if (direction == 'desc') sorted.reverse()
    visibleByCategory[k] = sorted
  })
  return visibleByCategory
}
