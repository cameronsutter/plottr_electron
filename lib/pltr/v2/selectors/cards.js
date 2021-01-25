import { createSelector } from 'reselect'
import { sortBy } from 'lodash'
import { isSeriesSelector, timelineFilterIsEmptySelector, timelineFilterSelector } from './ui'
import { nextId } from '../store/newIds'

export const allCardsSelector = (state) => state.cards

export const nextCardIdSelector = createSelector(allCardsSelector, (cards) => nextId(cards))

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

export const visibleCardsSelector = createSelector(
  allCardsSelector,
  timelineFilterSelector,
  timelineFilterIsEmptySelector,
  (cards, filter, filterIsEmpty) => {
    return cards.reduce((acc, c) => {
      acc[c.id] = cardIsVisible(c, filter, filterIsEmpty)
      return acc
    }, {})
  }
)

function cardReduce(lineAttr, beatAttr) {
  return (acc, card) => {
    const val = acc[`${card[lineAttr]}-${card[beatAttr]}`]
    if (val && val.length) {
      const cards = [...val, card]
      const sortedCards = sortBy(cards, 'positionWithinLine')
      acc[`${card[lineAttr]}-${card[beatAttr]}`] = sortedCards
    } else {
      acc[`${card[lineAttr]}-${card[beatAttr]}`] = [card]
    }

    return acc
  }
}

function cardIsVisible(card, filter, filterIsEmpty) {
  if (filterIsEmpty) return true

  return Object.keys(filter).some((attr) => {
    return filter[attr].some((val) => {
      // this is AND logic
      // return card[`${attr}s`].includes(val)

      // this is OR logic
      if (attr == 'tag') {
        return card.tags.includes(val)
      }
      if (attr == 'character') {
        return card.characters.includes(val)
      }
      if (attr == 'place') {
        return card.places.includes(val)
      }
      return false
    })
  })
}
