import cardsReducer from '../cards'

describe('cardsReducer', () => {
  it('should produce a valid state object when supplied with an unknown event type', () => {
    const emptyState = []
    expect(cardsReducer(emptyState, { type: 'derp' })).toEqual(emptyState)
  })
})
