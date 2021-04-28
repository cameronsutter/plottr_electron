import { createSelector } from 'reselect'
import { sortBy } from 'lodash'
import { timelineFilterIsEmptySelector, timelineFilterSelector } from './ui'
import { findNode, nodeParent } from '../reducers/tree'
import { nextId } from '../store/newIds'
import { beatsByBookSelector, sortedBeatsByBookSelector } from './beats'

export const allCardsSelector = (state) => state.cards

export const nextCardIdSelector = createSelector(allCardsSelector, (cards) => nextId(cards))

export const collapsedBeatSelector = createSelector(
  beatsByBookSelector,
  sortedBeatsByBookSelector,
  (beatTree, sortedBeats) => {
    const collapsedBeats = new Map()
    const firstCollapsedParent = (beatId) => {
      if (!beatId) return null
      if (collapsedBeats.has(beatId)) {
        return collapsedBeats.get(beatId)
      }
      const directParentId = nodeParent(beatTree, beatId)
      const collapsedParentId = firstCollapsedParent(directParentId)
      if (collapsedParentId) {
        collapsedBeats.set(beatId, collapsedParentId)
        return collapsedParentId
      }
      const thisBeat = findNode(beatTree, beatId)
      if (!thisBeat.expanded) {
        collapsedBeats.set(beatId, beatId)
        return beatId
      }
      collapsedBeats.set(beatId, null)
      return null
    }
    sortedBeats.forEach((beat) => {
      firstCollapsedParent(beat.id)
    })
    return collapsedBeats
  }
)

export const cardMapSelector = createSelector(
  allCardsSelector,
  collapsedBeatSelector,
  (cards, collapsedBeats) => {
    return cards.reduce(cardReduce('lineId', 'beatId', collapsedBeats), {})
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

function cardReduce(lineAttr, beatAttr, collapsedBeats) {
  return (acc, card) => {
    const cardBeatId = card[beatAttr]
    const beatId = (collapsedBeats && collapsedBeats.get(cardBeatId)) || cardBeatId
    const val = acc[`${card[lineAttr]}-${beatId}`]
    if (val && val.length) {
      const cards = [...val, card]
      const sortedCards = sortBy(cards, 'positionWithinLine')
      acc[`${card[lineAttr]}-${beatId}`] = sortedCards
    } else {
      acc[`${card[lineAttr]}-${beatId}`] = [card]
    }

    return acc
  }
}

function cardIsVisible(card, filter, filterIsEmpty) {
  if (filterIsEmpty) return true

  return Object.keys(filter).some((attr) => {
    return filter[attr].some((val) => {
      if (card[attr] !== undefined) {
        return card[attr] === val
      }
      if (val === '' && card[attr] === undefined) {
        return true
      }
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
