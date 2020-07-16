import { sortBy } from 'lodash'

export function sortCardsInChapter (autoSort, cards) {
  let sortOperands = []
  if (autoSort) {
    sortOperands = ['positionWithinLine', 'lineId']
  } else {
    sortOperands = ['positionInChapter']
  }
  return sortBy(cards, sortOperands)
}