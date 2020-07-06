import { createSelector } from 'reselect'
import { sortBy } from 'lodash'
import { isSeriesSelector } from './ui'

export const allCardsSelector = state => state.cards

export const cardMapSelector = createSelector(
  allCardsSelector,
  isSeriesSelector,
  (cards, isSeries) => {
    if (isSeries) {
      return cards.reduce(cardReduce('seriesLineId', 'beatId'), {})
    } else {
      return cards.reduce(cardReduce('lineId', 'chapterId'), {})
    }
  }
)

function cardReduce (lineAttr, beatAttr) {
  return (acc, card) => {
    const val = acc[`${card[lineAttr]}-${card[beatAttr]}`]
    if (val && val.length) {
      const cards = [...val, card]
      const sortedCards = sortBy(cards, 'position')
      acc[`${card[lineAttr]}-${card[beatAttr]}`] = sortedCards
    } else {
      acc[`${card[lineAttr]}-${card[beatAttr]}`] = [card]
    }

    return acc
  }
}