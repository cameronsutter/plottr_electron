import { normalize } from '../Normalizer'

describe('normalize', () => {
  describe('given empty content', () => {
    it('should produce empty content', () => {
      expect(normalize([])).toEqual([])
    })
  })
  describe('given a single paragraph', () => {
    const content = [
      {
        type: 'paragraph',
        children: [
          {
            text: 'how bout this',
          },
        ],
      },
    ]
    it('should produce that paragraph', () => {
      expect(normalize(content)).toEqual(content)
    })
  })
  describe('given a paragraph in a paragraph', () => {
    const content = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'how bout this',
              },
            ],
          },
        ],
      },
    ]
    it('should produce singly nested paragraph', () => {
      const singlyNestedContent = [
        {
          type: 'paragraph',
          children: [
            {
              text: 'how bout this',
            },
          ],
        },
      ]
      expect(normalize(content)).toEqual(singlyNestedContent)
    })
  })
  describe('given a paragraph in a paragraph, in a paragraph', () => {
    const content = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'how bout this',
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
    it('should produce singly nested paragraph', () => {
      const singlyNestedContent = [
        {
          type: 'paragraph',
          children: [
            {
              text: 'how bout this',
            },
          ],
        },
      ]
      expect(normalize(content)).toEqual(singlyNestedContent)
    })
  })
})
