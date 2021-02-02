import exportChapters from '../chapters'
import { resetId } from '../../utils'
import { state } from './fixtures'
import { paragraph } from 'components/rce/__fixtures__'

describe('exportChapters', () => {
  let documentContents = {}
  beforeEach(() => resetId())

  it('exports chapter binders from state', () => {
    const binderItems = exportChapters(state, documentContents)
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
        docTitle: 'Plotline: Main Story Arc',
        description: [paragraph('So paragraph')],
      },
      5: {
        docTitle: 'Plotline: Main Story Arc',
        description: [paragraph('Moar paragraph')],
      },
      7: {
        docTitle: 'Plotline: Main Story Arc',
        description: [paragraph('A paragraph')],
      },
    })
  })
})
