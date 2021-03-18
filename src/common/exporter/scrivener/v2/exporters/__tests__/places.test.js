import exportPlaces from '../places'
import { resetId } from '../../utils'
import { state } from './fixtures'
import { headingTwo, paragraph } from 'components/rce/__fixtures__'
import default_config from '../../../../default_config'

describe('exportPlaces', () => {
  let documentContents = {}
  beforeEach(() => resetId())

  it('exports places binder from state', () => {
    const binderItem = exportPlaces(state, documentContents, default_config.scrivener)
    expect(binderItem).toMatchObject({
      _attributes: {
        Type: 'Folder',
      },
      Title: {
        _text: 'Places',
      },
      Children: {
        BinderItem: [
          {
            Title: {
              _text: 'first place',
            },
            _attributes: {
              Type: 'Text',
            },
          },
        ],
      },
    })
  })

  it('exports the documentContents', () => {
    expect(documentContents).toEqual({
      4: {
        body: {
          docTitle: 'first place',
          description: [
            headingTwo('Description'),
            paragraph('my favorite place'),
            headingTwo('notes'),
            ...state.places[0].notes,
            headingTwo('weather'),
            paragraph('stormy'),
            headingTwo('Tags'),
            paragraph('wonder'),
            headingTwo('Template attribute'),
            paragraph('This is a template attribute'),
          ],
        },
      },
    })
  })
})
