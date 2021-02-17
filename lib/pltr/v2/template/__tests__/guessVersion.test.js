import { guessVersion } from '../'

import { prior_to_2020_7_7, prior_to_2020_8_28, prior_to_2021_2_8 } from './fixtures'

describe('guessVersion', () => {
  describe('given a partial plottr file (i.e. template data)', () => {
    describe('created from a version prior to the 2020.7.7 migration and after 2020.5.5', () => {
      it('should produce 2020.7.6', () => {
        expect(guessVersion(prior_to_2020_7_7.templateData)).toEqual('2020.7.6')
      })
    })
    describe('created from a version prior to the 2020.8.28 migration and after 2020.7.7', () => {
      it('should produce 2020.8.27', () => {
        expect(guessVersion(prior_to_2020_8_28.templateData)).toEqual('2020.8.27')
      })
    })
    describe('created from a version prior to the 2021.2.8 migration and after 2020.8.28', () => {
      it('should produce 2021.2.7', () => {
        expect(guessVersion(prior_to_2021_2_8.templateData)).toEqual('2021.2.7')
      })
    })
  })
})
