import { ADD_CARD, ADD_CARD_IN_CHAPTER } from '../../constants/ActionTypes'
import { card as defaultCard } from '../../../../shared/initialState'
import cardsReducer from '../cards'
import { isEqual, uniq } from 'lodash'
import { allCardsSelector } from '../../selectors/cards'

// Only these functions should change if we change the structure of
// the state object.
const mountToState = (cards) => ({ cards })
const cardInState = ({ cards }, card) => cards.find((x) => isEqual(x, card))
const emptyState = []
const oneCardState = [defaultCard]

describe('cardsReducer', () => {
  it('should produce a valid state object when supplied with an unknown event type', () => {
    expect(cardsReducer(emptyState, { type: 'herpa' })).toEqual(emptyState)
  })
  it('should produce an empty array when given no state object', () => {
    expect(cardsReducer(null, { type: 'derp' })).toEqual(emptyState)
  })
  describe('add card', () => {
    it('should add the default card if it is given a null card', () => {
      expect(
        cardInState(
          mountToState(cardsReducer(emptyState, { type: ADD_CARD, card: {} })),
          defaultCard
        )
      ).toEqual(defaultCard)
    })
    it('should produce a two card state from a one card state', () => {
      expect(
        allCardsSelector(mountToState(cardsReducer(oneCardState, { type: ADD_CARD, card: {} })))
      ).toHaveLength(2)
    })
    it('should produce cards with unique ids', () => {
      expect(
        uniq(
          allCardsSelector(
            mountToState(cardsReducer(oneCardState, { type: ADD_CARD, card: {} }))
          ).map(({ id }) => id)
        )
      ).toHaveLength(2)
    })
    it('should produce a one card state from an undefined state object', () => {
      expect(
        allCardsSelector(mountToState(cardsReducer(undefined, { type: ADD_CARD, card: {} })))
      ).toHaveLength(1)
    })
  })
  describe('add card in chapter', () => {
    it('should add a card at position zero to an empty chapter', () => {
      expect(
        cardInState(
          mountToState(cardsReducer(emptyState, { type: ADD_CARD_IN_CHAPTER, card: defaultCard })),
          defaultCard
        )
      ).toEqual(defaultCard)
    })
    describe('given a single card state', () => {
      describe('and given the re order ids [null, 1]', () => {
        it('should add a new card at positionWithinLine = 0', () => {
          expect(
            allCardsSelector(
              mountToState(
                cardsReducer(oneCardState, {
                  type: ADD_CARD_IN_CHAPTER,
                  card: defaultCard,
                  reorderIds: [null, 1],
                })
              )
            ).map(({ id, positionWithinLine }) => [id, positionWithinLine])
          ).toEqual([
            [2, 0],
            [1, 1],
          ])
        })
      })
      describe('and given the re order ids [1, null]', () => {
        it('should add a new card at positionWithinLine = 1', () => {
          expect(
            allCardsSelector(
              mountToState(
                cardsReducer(oneCardState, {
                  type: ADD_CARD_IN_CHAPTER,
                  card: defaultCard,
                  reorderIds: [1, null],
                })
              )
            ).map(({ id, positionWithinLine }) => [id, positionWithinLine])
          ).toEqual([
            [2, 1],
            [1, 0],
          ])
        })
      })
    })
  })
})
