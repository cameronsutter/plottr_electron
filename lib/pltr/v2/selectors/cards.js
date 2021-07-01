import { createSelector } from 'reselect'
import { createSelectorCreator, defaultMemoize } from 'reselect'
import { isEqual } from 'lodash'
import { sortBy } from 'lodash'
import { timelineFilterIsEmptySelector, timelineFilterSelector } from './ui'
import { findNode, nodeParent } from '../reducers/tree'
import { nextId } from '../store/newIds'
import { beatsByBookSelector, sortedBeatsByBookSelector } from './beats'

export const allCardsSelector = (state) => state.cards

const templateMetadata = (template) => {
  return {
    ...template,
    attributes: template.attributes.map((attribute) => {
      const { name, type } = attribute
      return { name, type }
    }),
  }
}

const cardMetaData = (card) => {
  const {
    id,
    beatId,
    lineId,
    tags,
    color,
    places,
    characters,
    bookId,
    title,
    templates,
    positionWithinLine,
  } = card

  return {
    id,
    beatId,
    lineId,
    tags,
    color,
    places,
    characters,
    bookId,
    title,
    templates: templates.map(templateMetadata),
    positionWithinLine,
  }
}

export const allCardMetaDataSelector = (state) => state.cards.map(cardMetaData)

export const nextCardIdSelector = createSelector(allCardsSelector, (cards) => nextId(cards))

export const cardIdSelector = (state, cardId) => cardId

export const cardByIdSelector = createSelector(
  cardIdSelector,
  allCardsSelector,
  (cardId, cards) => {
    return cards.find((card) => card.id === cardId)
  }
)

export const cardDescriptionByIdSelector = createSelector(
  cardByIdSelector,
  (card) => card && card.description
)

export const cardMetaDataSelector = createSelector(cardByIdSelector, (card) => {
  if (!card) return null

  return cardMetaData(card)
})

export const attributeValueSelector = (cardId, attributeName) => (state) =>
  cardByIdSelector(state, cardId)[attributeName]

export const templateAttributeValueSelector = (cardId, templateId, attributeName) => (state) => {
  const card = cardByIdSelector(state, cardId)
  const templateOnCard = card && card.templates.find(({ id }) => id === templateId)
  return (
    templateOnCard && templateOnCard.attributes.find(({ name }) => name === attributeName).value
  )
}

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
  sortedBeatsByBookSelector,
  (cards, collapsedBeats, allSortedBeats) => {
    const beatIds = allSortedBeats.map(({ id }) => id)
    const beatPositions = beatIds.map((x) => x)
    beatIds.forEach((beatId, index) => (beatPositions[beatId] = index))
    return cards.reduce(cardReduce('lineId', 'beatId', collapsedBeats, beatPositions), {})
  }
)

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual)

export const cardMetaDataMapSelector = createDeepEqualSelector(
  allCardMetaDataSelector,
  collapsedBeatSelector,
  sortedBeatsByBookSelector,
  (cards, collapsedBeats, allSortedBeats) => {
    const beatIds = allSortedBeats.map(({ id }) => id)
    const beatPositions = beatIds.map((x) => x)
    beatIds.forEach((beatId, index) => (beatPositions[beatId] = index))
    return cards.reduce(cardReduce('lineId', 'beatId', collapsedBeats, beatPositions), {})
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

function cardReduce(lineAttr, beatAttr, collapsedBeats, beatPositions) {
  return (acc, card) => {
    const cardBeatId = card[beatAttr]
    const beatId = (collapsedBeats && collapsedBeats.get(cardBeatId)) || cardBeatId
    const val = acc[`${card[lineAttr]}-${beatId}`]
    if (val && val.length) {
      const cards = [...val, card]
      const sortedCards = sortBy(sortBy(cards, 'positionWithinLine'), (card) => {
        const beatId = card[beatAttr]
        return beatPositions[beatId]
      })
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
