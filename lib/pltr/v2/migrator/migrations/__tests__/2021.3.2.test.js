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
      describe('with the flat array representation of beats for three books', () => {
        const arrayOfBeatsFromTwoBooks = [
          {
            autoOutlineSort: true,
            bookId: 'series',
            fromTemplateId: null,
            id: 10,
            position: 0,
            time: 0,
            title: 'auto',
          },
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
          books: {
            1: {
              id: 1,
              title: '',
              premise: '',
              genre: '',
              theme: '',
              templates: [],
              timelineTemplates: [
                {
                  id: 'pl8',
                },
                {
                  id: 'pl8',
                  name: 'Romance Beat Sheet',
                },
                {
                  id: 'pl8',
                  name: 'Romance Beat Sheet',
                },
              ],
              imageId: null,
            },
            2: {
              id: 2,
              title: '',
              premise: '',
              genre: '',
              theme: '',
              templates: [],
              timelineTemplates: [],
              imageId: null,
            },
            allIds: [1, 2],
          },
        }
        const migrated = migrate(fileWithArrayOfBeatsAndNoHierarchy)
        it('should add all those beats to the index of the correct book id', () => {
          expect(Object.values(migrated.beats.series.index)).toEqual(
            expect.arrayContaining([
              {
                autoOutlineSort: true,
                bookId: 'series',
                fromTemplateId: null,
                id: 10,
                position: 0,
                time: 0,
                title: 'auto',
                expanded: true,
              },
            ])
          )
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
                expanded: true,
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
                expanded: true,
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
                expanded: true,
              },
              {
                autoOutlineSort: true,
                bookId: 2,
                fromTemplateId: null,
                id: 40,
                position: 19,
                time: 0,
                title: 'auto',
                expanded: true,
              },
            ])
          )
        })
        it('should make all the beats children of root', () => {
          expect(
            countBy(Object.values(migrated.beats.series.heap), (x) => x === null).true
          ).toEqual(1)
          expect(countBy(Object.values(migrated.beats[1].heap), (x) => x === null).true).toEqual(2)
          expect(countBy(Object.values(migrated.beats[2].heap), (x) => x === null).true).toEqual(2)
          expect(migrated.beats.series.children[null]).toEqual(expect.arrayContaining([10]))
          expect(migrated.beats[1].children[null]).toEqual(expect.arrayContaining([6, 7]))
          expect(migrated.beats[2].children[null]).toEqual(expect.arrayContaining([40, 41]))
        })
        it('should add the "expanded" attribute to all those beats', () => {
          expect(
            countBy(Object.values(migrated.beats.series.index), ({ expanded }) => expanded).true
          ).toEqual(1)
          expect(
            countBy(Object.values(migrated.beats[1].index), ({ expanded }) => expanded).true
          ).toEqual(2)
          expect(
            countBy(Object.values(migrated.beats[2].index), ({ expanded }) => expanded).true
          ).toEqual(2)
        })
      })
    })
  })
})
