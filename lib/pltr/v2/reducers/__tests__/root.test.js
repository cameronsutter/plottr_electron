import { ADD_LINES_FROM_TEMPLATE } from '../../constants/ActionTypes'
import rootReducerWithoutRepairers from '../root'
import { beatsByPosition } from '../../helpers/beats'

const rootReducer = rootReducerWithoutRepairers({
  normalizeRCEContent: (x) => x,
})

describe('rootReducer', () => {
  describe('ADD_LINES_FROM_TEMPLATE', () => {
    const enoughBeats = require('./fixtures/enough_beats.json')
    const notEnoughBeats = require('./fixtures/not_enough_beats.json')
    const templateData = require('./fixtures/7_point_template.json')
    const action = { type: ADD_LINES_FROM_TEMPLATE, templateData }
    describe('enough beats', () => {
      const result = rootReducer(enoughBeats, action)
      const beatsAfter = beatsByPosition(() => true)(result.beats['1']).map(({ id }) => id)
      it('doesnt add more beats', () => {
        const beatsBefore = beatsByPosition(() => true)(enoughBeats.beats['1']).map(({ id }) => id)
        expect(beatsBefore.length).toEqual(beatsAfter.length)
      })
      it('adds one line', () => {
        expect(result.lines.length).toEqual(enoughBeats.lines.length + 1)
      })
      it('gives cards the right ids', () => {
        // choose a random postion: 2
        // there should be a card there
        const beatId = beatsAfter[2]
        const card = result.cards.find((c) => c.beatId == beatId)
        expect(card).not.toEqual(undefined)
        expect(card.title).toEqual('Pinch 1')
      })
    })
    describe('not enough beats', () => {
      const result = rootReducer(notEnoughBeats, action)
      const beatsAfter = beatsByPosition(() => true)(result.beats['1']).map(({ id }) => id)
      it('adds more beats', () => {
        const beatsBefore = beatsByPosition(() => true)(notEnoughBeats.beats['1']).map(
          ({ id }) => id
        )
        expect(beatsBefore.length).not.toEqual(beatsAfter.length)
      })
      it('adds one line', () => {
        expect(result.lines.length).toEqual(notEnoughBeats.lines.length + 1)
      })
      it('gives cards the right ids', () => {
        // choose a random postion (after the last beat in the file): 2
        // there should be a card there
        const beatId = beatsAfter[2]
        const card = result.cards.find((c) => c.beatId == beatId)
        expect(card).not.toEqual(undefined)
        expect(card.title).toEqual('Pinch 1')
      })
    })
  })
})
