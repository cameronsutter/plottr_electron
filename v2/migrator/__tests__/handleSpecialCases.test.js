import {
  file_2021_07_20,
  file_2021_07_20_missing_templates_on_cards,
  file_1_2_23,
  file_2021_07_07,
} from './fixtures'
import applyAllFixes, {
  handle2021_07_07,
  handleMissingTemplatesFieldOnCards,
} from '../handleSpecialCases'

describe('handle2021_07_07', () => {
  describe('given a file with a different version', () => {
    it('should produce that file, untouched', () => {
      expect(handle2021_07_07(file_2021_07_20)).toEqual(file_2021_07_20)
    })
  })
  describe('given a file with the problematic version', () => {
    it('should give light and dark config to all hierarchy levels', () => {
      const fixed = handle2021_07_07(file_2021_07_07)
      const levels = Object.values(fixed.hierarchyLevels)
      for (const level of levels) {
        expect(level.light).toBeDefined()
        expect(level.light.borderColor).toBeDefined()
        expect(level.light.textColor).toBeDefined()
        expect(level.dark).toBeDefined()
        expect(level.dark.borderColor).toBeDefined()
        expect(level.dark.textColor).toBeDefined()
      }
      expect(fixed.file.appliedMigrations).toEqual(expect.arrayContaining(['m2021_7_7']))
    })
  })
})

describe('handleMissingTemplatesFieldOnCards', () => {
  describe('given a file older than the addition of templates', () => {
    it('should do nothing to the file', () => {
      expect(handleMissingTemplatesFieldOnCards(file_1_2_23)).toBe(file_1_2_23)
    })
  })
  describe('given a file more recent than the addition of templates', () => {
    describe('but with no problem fields', () => {
      it('should leave the file as-is', () => {
        expect(handleMissingTemplatesFieldOnCards(file_2021_07_20)).toBe(file_2021_07_20)
      })
    })
    describe('with cards that lack the templates property', () => {
      it('should fix those cards', () => {
        const thereAreMissingTemplatesBefore =
          file_2021_07_20_missing_templates_on_cards.cards.some(
            (card) => !card.templates || !Array.isArray(card.templates)
          )
        expect(thereAreMissingTemplatesBefore).toEqual(true)
        const fixed = handleMissingTemplatesFieldOnCards(file_2021_07_20_missing_templates_on_cards)
        const thereAreMissingTemplates = fixed.cards.some(
          (card) => !card.templates || !Array.isArray(card.templates)
        )
        expect(thereAreMissingTemplates).toEqual(false)
      })
    })
  })
})

describe('applyAllFixes', () => {
  describe('given a file with a version that has no problems', () => {
    it('should levae the file, as-is', () => {
      expect(applyAllFixes(file_2021_07_20)).toEqual(file_2021_07_20)
    })
  })
  describe('given a file with a version that has the 2021-07-07 problem', () => {
    it('should levae the file, as-is', () => {
      const fixed = applyAllFixes(file_2021_07_07)
      const levels = Object.values(fixed.hierarchyLevels)
      for (const level of levels) {
        expect(level.light).toBeDefined()
        expect(level.light.borderColor).toBeDefined()
        expect(level.light.textColor).toBeDefined()
        expect(level.dark).toBeDefined()
        expect(level.dark.borderColor).toBeDefined()
        expect(level.dark.textColor).toBeDefined()
      }
      expect(fixed.file.appliedMigrations).toEqual(expect.arrayContaining(['m2021_7_7']))
    })
  })
})
