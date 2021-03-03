import migration from '../2021.2.8'

jest.mock('format-message')

describe('2021.2.8', () => {
  const { state_2021_2_8 } = require('./fixtures')
  const newFile = state_2021_2_8
  describe('given the empty file state', () => {
    it('should produce the empty file state', () => {
      expect(migration(newFile)).toEqual(newFile)
    })
  })
  describe('given a state with a chapter in it', () => {
    const { chapter, card } = require('../../../store/initialState')
    const stateWithOneChapter = {
      ...newFile,
      chapters: [chapter],
      cards: [
        { ...card, id: 99, beatId: 1 },
        { ...card, id: 100, beatId: 1 },
      ],
    }
    it('should effect a change of any nature', () => {
      expect(migration(stateWithOneChapter)).not.toEqual(stateWithOneChapter)
    })
    describe('and no beats', () => {
      const stateWithOneChapterAndNoBeats = {
        ...stateWithOneChapter,
        beats: [],
      }
      it('should produce a state with that chapter as the only beat', () => {
        const migrated = migration(stateWithOneChapterAndNoBeats)
        expect(migrated.chapters).toBeUndefined()
        // The next available id is 1 if there are no beats.
        expect(migrated.beats).toEqual([{ ...chapter, id: 1 }])
      })
    })
    describe('and at least one beat', () => {
      it('should retain that beat after migration', () => {
        expect(stateWithOneChapter.beats).not.toHaveLength(0)
        expect(migration(stateWithOneChapter).beats).toEqual(
          expect.arrayContaining(stateWithOneChapter.beats)
        )
      })
      it('should produce unique ids for the beats', () => {
        const allIds = migration(stateWithOneChapter).beats.map(({ id }) => id)
        expect([...new Set(allIds)]).toEqual(allIds)
      })
    })
    describe('and cards which refer to that chapter', () => {
      const stateWithCardsReferringToTheChapter = {
        ...stateWithOneChapter,
        cards: [{ ...card, chapterId: chapter.id }],
      }
      it("should change the id of the card to point at the migrated chapter's id", () => {
        const migrated = migration(stateWithCardsReferringToTheChapter)
        expect(migration(migrated).cards).toEqual([{ ...card, beatId: migrated.beats.length }])
      })
      describe('and other cards already present', () => {
        const stateWithCardsReferringToTheChapterAndExistingCards = {
          ...stateWithOneChapter,
          cards: [{ ...card, chapterId: chapter.id }, ...stateWithOneChapter.cards],
        }
        it('should leave the existing cards alone', () => {
          expect(stateWithOneChapter.cards).not.toHaveLength(0)
          expect(migration(stateWithCardsReferringToTheChapterAndExistingCards.cards)).toEqual(
            expect.arrayContaining(stateWithCardsReferringToTheChapterAndExistingCards.cards)
          )
        })
      })
    })
  })
  describe('given a state with two chapters in it', () => {
    const { chapter } = require('../../../store/initialState')
    const chapters = [
      { ...chapter, id: 1 },
      { ...chapter, id: 2, title: 'Another Chapter' },
    ]
    const stateWithOneChapter = {
      ...newFile,
      chapters,
    }
    it('should effect a change of any nature', () => {
      expect(migration(stateWithOneChapter)).not.toEqual(stateWithOneChapter)
    })
    describe('and no beats', () => {
      const stateWithOneChapterAndNoBeats = {
        ...stateWithOneChapter,
        beats: [],
      }
      it('should produce a state with that chapter as the only beat', () => {
        const migrated = migration(stateWithOneChapterAndNoBeats)
        expect(migrated.chapters).toBeUndefined()
        expect(migrated.beats).toEqual(expect.arrayContaining(chapters))
      })
    })
    describe('and more than one beat', () => {
      it('should retain that beat after migration', () => {
        expect(stateWithOneChapter.beats.length).toBeGreaterThan(1)
        expect(migration(stateWithOneChapter).beats).toEqual(
          expect.arrayContaining(stateWithOneChapter.beats)
        )
      })
    })
  })
})
