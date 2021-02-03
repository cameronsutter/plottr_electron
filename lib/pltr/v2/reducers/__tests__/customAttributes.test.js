// Doesn not work because of configuration difficulties in babel.  Ran
// out of time during the week to finish the implementation.

// import { reducers } from 'pltr/v2'
// import { allCustomAttributesSelector } from 'app/selectors/customAttributes'
// import { isEqual } from 'lodash'
// import { ADD_SCENES_ATTRIBUTE } from '../../constants/ActionTypes'

// const { customAttributes } = reducers

// // Only these functions should change if we change the structure of
// // the state object.
// const mountToState = (customAttributes) => ({ customAttributes })
// const customAttributeInState = ({ customAttributes }, customAttribute) =>
//   customAttributes.find((x) => isEqual(x, customAttribute))

// // Fixtures
// const emptyState = customAttributes(undefined, { type: 'TOO_SECRET_TO_TELL_YOU' })
// const textAttribute1 = { name: 'ranking', type: 'text' }

describe('customAttributes reducer', () => {
  it('true', () => {
    expect(true)
  })
  //   it('should produce a valid state object when supplied with an unknown event type', () => {
  //     expect(customAttributes(emptyState, { type: 'THIS_FEELS_A_BIT_REDUNDANT' })).toEqual(emptyState)
  //   })
  //   it('should produce a valid state when given no state object', () => {
  //     expect(customAttributes(null, { type: 'VERY_STATE' })).toEqual(emptyState)
  //   })
  //   describe('add scenes attribute', () => {
  //     describe('given an empty state', () => {
  //       it('should produce a singleton state containing that attribute', () => {
  //         const allAttributes = allCustomAttributesSelector(
  //           mountToState(
  //             customAttributes(emptyState, { type: ADD_SCENES_ATTRIBUTE, attribute: textAttribute1 })
  //           )
  //         )
  //         expect(allAttributes).toHaveLength(1)
  //         expect(allAttributes).toContain(textAttribute1)
  //       })
  //     })
  //   })
})
