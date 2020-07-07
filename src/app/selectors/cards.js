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

// MAYBE: this selector should return a map of all cards and whether they are visible
// and then each card can check if it's visible

// export const cardIsFilteredSelector = createSelector(
//   allCardsSelector,
//   () => {}
// )

// TODO: should be a selector on each card
// or cache this somewhere
function cardIsFiltered (card) {
  if (!card) return false
  const filter = this.props.filter
  if (filter == null) return true

  // TODO: there's got to be a better way to do this logic
  let filtered = true
  if (card.tags) {
    card.tags.forEach((tId) => {
      if (filter['tag'].indexOf(tId) !== -1) filtered = false
    })
  }
  if (card.characters) {
    card.characters.forEach((cId) => {
      if (filter['character'].indexOf(cId) !== -1) filtered = false
    })
  }
  if (card.places) {
    card.places.forEach((pId) => {
      if (filter['place'].indexOf(pId) !== -1) filtered = false
    })
  }
  return filtered
}