import {
  ADD_CARD,
  ADD_CARD_IN_CHAPTER,
  ADD_LINES_FROM_TEMPLATE,
  EDIT_CARD_DETAILS,
  EDIT_SCENES_ATTRIBUTE,
} from '../../constants/ActionTypes'
import { card as defaultCard } from '../../../../shared/initialState'
import cardsReducer from '../cards'
import { isEqual, uniq } from 'lodash'
import { allCardsSelector } from '../../selectors/cards'

// Only these functions should change if we change the structure of
// the state object.
const mountToState = (cards) => ({ cards })
const cardInState = ({ cards }, card) => cards.find((x) => isEqual(x, card))
const cardIdInState = ({ cards }, cardId) => cards.find(({ id }) => id === cardId)

// Test fixtures
const emptyState = cardsReducer(undefined, { type: 'blarg' })
const oneCardState = cardsReducer(undefined, { type: ADD_CARD, card: defaultCard })
const card1 = { ...defaultCard, id: 1 }
const card2 = { ...defaultCard, id: 2 }
const card3 = { ...defaultCard, id: 3 }
const card4 = { ...defaultCard, id: 4 }
const fourCardState = cardsReducer(undefined, {
  type: ADD_LINES_FROM_TEMPLATE,
  cards: [card1, card2, card3, card4],
})
const cardWithStrength = { ...defaultCard, strength: 'You bet!' }
const strengthState = cardsReducer(undefined, { type: ADD_CARD, card: cardWithStrength })

describe('cardsReducer', () => {
  it('should produce a valid state object when supplied with an unknown event type', () => {
    expect(cardsReducer(emptyState, { type: 'herpa' })).toEqual(emptyState)
  })
  it('should produce a valid state when given no state object', () => {
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
  describe('add lines from template', () => {
    it('should add all given cards to the state', () => {
      expect(
        allCardsSelector(
          mountToState(
            cardsReducer(emptyState, {
              type: ADD_LINES_FROM_TEMPLATE,
              cards: [card1, card2, card3, card4],
            })
          )
        )
      ).toEqual([card1, card2, card3, card4])
    })
  })
  describe('edit card details', () => {
    describe('given the default state', () => {
      it('should produce the default state', () => {
        expect(
          cardsReducer(emptyState, {
            type: EDIT_CARD_DETAILS,
            id: 0,
            attributes: {
              best: true,
            },
          })
        ).toEqual(emptyState)
      })
    })
    describe('given a one card state', () => {
      describe('and an id for a different card', () => {
        it('should produce the same one card state', () => {
          expect(
            cardsReducer(oneCardState, {
              type: EDIT_CARD_DETAILS,
              id: 10,
              attributes: {
                best: true,
              },
            })
          ).toEqual(oneCardState)
        })
      })
      describe('and the id of that card', () => {
        it('should edit that card', () => {
          expect(
            allCardsSelector(
              mountToState(
                cardsReducer(oneCardState, {
                  type: EDIT_CARD_DETAILS,
                  id: 1,
                  attributes: {
                    best: true,
                  },
                })
              )
            )[0]
          ).toEqual({ ...defaultCard, best: true })
        })
      })
    })
    describe('given a four card state', () => {
      describe('and the id of card2', () => {
        it('should only edit card2', () => {
          expect(
            cardIdInState(
              mountToState(
                cardsReducer(fourCardState, {
                  type: EDIT_CARD_DETAILS,
                  id: 2,
                  attributes: {
                    best: true,
                  },
                })
              ),
              2
            )
          ).toEqual({ ...card2, best: true })
        })
      })
    })
  })
  // TODO: many tests to add.  Adding ones for recent features for
  // expedience.
  describe('edit scenes attributes', () => {
    describe('given an attribute to change', () => {
      const oldAttribute = { name: 'strength', type: 'text' }
      const newAttribute = { name: 'do-you-even-lift?', type: 'text' }
      describe('and the empty state', () => {
        it('should produce the empty state', () => {
          expect(
            cardsReducer(emptyState, {
              type: EDIT_SCENES_ATTRIBUTE,
              oldAttribute,
              newAttribute,
            })
          ).toEqual(emptyState)
        })
      })
      describe('and a four card state where no card contains the attribute', () => {
        it('should add the attribute to those cards', () => {
          expect(
            allCardsSelector(
              mountToState(
                cardsReducer(fourCardState, {
                  type: EDIT_SCENES_ATTRIBUTE,
                  oldAttribute,
                  newAttribute,
                })
              )
            )
          ).toEqual(
            fourCardState.map((card) => ({ ...card, ...{ [newAttribute.name]: undefined } }))
          )
        })
      })
      describe('and a state where a card has the original attribute', () => {
        it('should change the name of the attribute', () => {
          expect(
            cardIdInState(
              mountToState(
                cardsReducer(strengthState, {
                  type: EDIT_SCENES_ATTRIBUTE,
                  oldAttribute,
                  newAttribute,
                })
              ),
              1
            )
          ).toEqual({
            ...cardWithStrength,
            strength: undefined,
            'do-you-even-lift?': 'You bet!',
          })
        })
      })
    })
  })
})
