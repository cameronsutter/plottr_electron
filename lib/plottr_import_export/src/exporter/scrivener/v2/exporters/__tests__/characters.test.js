import exportCharacters from '../characters'
import { resetId } from '../../utils'
import { state } from './fixtures'
import { headingTwo, paragraph } from 'components/__fixtures__'
import default_config from '../../../../default_config'

describe('exportCharacters', () => {
  beforeEach(() => resetId())

  it('exports characters binder from state', () => {
    const documentContents = {}
    const binderItem = exportCharacters(state, documentContents, default_config.scrivener)
    // there are 2 characters in the test state but the second one is part of book 2
    // so it shouldn't show up here
    expect(binderItem).toMatchObject({
      _attributes: {
        Type: 'Folder',
      },
      Title: {
        _text: 'Characters',
      },
      Children: {
        BinderItem: [
          {
            _attributes: {
              Type: 'Text',
            },
            Title: {
              _text: 'Father',
            },
          },
        ],
      },
    })
  })

  it('exports the documentContents', () => {
    const documentContents = {}
    const _binderItem = exportCharacters(state, documentContents, default_config.scrivener)
    // NOTE: description and notes are no longer in this test because
    // we changed how descriptions and notes are exported per book
    // with the new feature.  The root-level legacy attributes only
    // apply to the 'all'/'series' book.  We're exporting book one
    // here.
    expect(documentContents).toEqual({
      4: {
        body: {
          docTitle: 'Father',
          description: [
            headingTwo('age'),
            paragraph('50s'),
            headingTwo('stuff'),
            paragraph('something'),
            headingTwo('An attribute'),
            paragraph('Which attributes'),
          ],
        },
      },
    })
  })
})
