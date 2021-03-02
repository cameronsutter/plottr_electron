import { countBy } from 'lodash'

import migrate from '../2021.3.2'

jest.mock('format-message')

describe('migrate', () => {
  const { emptyFile, newFileHierarchies } = require('../../../store/newFileState')
  const newFile = emptyFile()
  describe('given the new file state', () => {
    it('should produce the initial state', () => {
      expect(migrate(newFile)).toEqual(newFile)
    })
    describe('without the hierarchyLevels attribute', () => {
      const newFileWithoutHierarchies = {
        ...newFile,
        hierarchyLevels: undefined,
      }
      it('should add the default hierarchy configuration', () => {
        expect(migrate(newFileWithoutHierarchies)).toEqual({
          ...newFileWithoutHierarchies,
          hierarchyLevels: newFileHierarchies,
        })
      })
      describe('with the flat array representation of beats for two books', () => {
        const arrayOfBeatsFromTwoBooks = [
          {
            autoOutlineSort: true,
            bookId: 2,
            fromTemplateId: null,
            id: 41,
            position: 20,
            time: 0,
            title: 'auto',
          },
          {
            autoOutlineSort: true,
            bookId: 2,
            fromTemplateId: null,
            id: 40,
            position: 19,
            time: 0,
            title: 'auto',
          },
          {
            id: 7,
            bookId: 1,
            position: 0,
            title: 'auto',
            time: 0,
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
          },
          {
            id: 6,
            bookId: 1,
            position: 1,
            title: 'auto',
            time: 0,
            templates: [],
            autoOutlineSort: true,
            fromTemplateId: null,
          },
        ]
        const fileWithArrayOfBeatsAndNoHierarchy = {
          ...newFileWithoutHierarchies,
          beats: arrayOfBeatsFromTwoBooks,
        }
        const migrated = migrate(fileWithArrayOfBeatsAndNoHierarchy)
        it('should add all those beats to the index of the correct book id', () => {
          expect(Object.values(migrated.beats[1].index)).toEqual(
            expect.arrayContaining([
              {
                id: 7,
                bookId: 1,
                position: 0,
                title: 'auto',
                time: 0,
                templates: [],
                autoOutlineSort: true,
                fromTemplateId: null,
              },
              {
                id: 6,
                bookId: 1,
                position: 1,
                title: 'auto',
                time: 0,
                templates: [],
                autoOutlineSort: true,
                fromTemplateId: null,
              },
            ])
          )
          expect(Object.values(migrated.beats[2].index)).toEqual(
            expect.arrayContaining([
              {
                autoOutlineSort: true,
                bookId: 2,
                fromTemplateId: null,
                id: 41,
                position: 20,
                time: 0,
                title: 'auto',
              },
              {
                autoOutlineSort: true,
                bookId: 2,
                fromTemplateId: null,
                id: 40,
                position: 19,
                time: 0,
                title: 'auto',
              },
            ])
          )
        })
        it('should make a single top level beat per book', () => {
          expect(countBy(Object.values(migrated.beats[1].heap).filter((x) => x === null))).toEqual(
            1
          )
          expect(countBy(Object.values(migrated.beats[2].heap).filter((x) => x === null))).toEqual(
            1
          )
        })
        it('should make all the beats children of the single top level beat', () => {
          expect(countBy(Object.values(migrated.beats[1].heap), (x) => x !== 42)).toEqual(2)
          expect(countBy(Object.values(migrated.beats[2].heap), (x) => x !== 43)).toEqual(2)
          expect(migrated.beats[1].children[42]).toEqual(expect.arrayContaining([6, 7]))
          expect(migrated.beats[2].children[43]).toEqual(expect.arrayContaining([40, 41]))
        })
        it('should add the "expanded" attribute to all those beats', () => {
          expect(
            countBy(Object.values(migrated.beats[1].index), ({ expanded }) => expanded)
          ).toEqual(2)
          expect(
            countBy(Object.values(migrated.beats[2].index), ({ expanded }) => expanded)
          ).toEqual(2)
        })
      })
    })
  })
})
