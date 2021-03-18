import exportBeats from '../beats'
import { resetId } from '../../utils'
import { state } from './fixtures'
import { paragraph, headingTwo } from 'components/rce/__fixtures__'
import default_config from '../../../../default_config'

describe('exportBeats', () => {
  let documentContents = {}
  beforeEach(() => resetId())

  it('exports beat binders from state', () => {
    const binderItems = exportBeats(state, documentContents, default_config.scrivener)
    expect(binderItems).toMatchObject([
      {
        _attributes: {
          Type: 'Folder',
          ID: 3,
        },
        Title: {
          _text: 'Chapter 6',
        },
        Children: {
          BinderItem: [
            {
              _attributes: {
                Type: 'Text',
                ID: 4,
              },
              Title: {
                _text: 'Running Away Again',
              },
            },
            {
              _attributes: {
                Type: 'Text',
                ID: 5,
              },
              Title: {
                _text: 'The Last Vizari',
              },
            },
          ],
        },
      },
      {
        _attributes: {
          Type: 'Folder',
          ID: 6,
        },
        Title: {
          _text: 'Chapter 43',
        },
        Children: {
          BinderItem: [
            {
              _attributes: {
                Type: 'Text',
              },
              Title: {
                _text: 'Back Home: Now for Mom and Dad',
              },
            },
          ],
        },
      },
    ])
  })

  it('exports the documentContents', () => {
    expect(documentContents).toEqual({
      4: {
        notes: {
          docTitle: 'Plotline: Main Story Arc',
          description: [headingTwo('Description'), paragraph('So paragraph')],
        },
      },
      5: {
        notes: {
          docTitle: 'Plotline: Main Story Arc',
          description: [headingTwo('Description'), paragraph('Moar paragraph')],
        },
      },
      7: {
        notes: {
          docTitle: 'Plotline: Main Story Arc',
          description: [headingTwo('Description'), paragraph('A paragraph')],
        },
      },
    })
  })
})
