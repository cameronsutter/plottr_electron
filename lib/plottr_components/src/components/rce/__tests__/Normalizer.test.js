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
  describe('given a heading with text in a paragraph in it', () => {
    const content = [
      {
        type: 'heading-one',
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
    it('should leave unwrap the paragraph', () => {
      const fixed = [
        {
          type: 'heading-one',
          children: [
            {
              text: 'how bout this',
            },
          ],
        },
      ]
      expect(normalize(content)).toEqual(fixed)
    })
  })
  describe('given a heading with text in it', () => {
    const content = [
      {
        type: 'heading-one',
        children: [
          {
            text: 'how bout this',
          },
        ],
      },
    ]
    it('should leave it as-is', () => {
      expect(normalize(content)).toEqual(content)
    })
  })
  describe('given a list', () => {
    describe('with no children', () => {
      const content = [
        {
          type: 'numbered-list',
          children: [
            {
              text: 'Test',
            },
          ],
        },
      ]
      it('should leave it as-is', () => {
        expect(normalize(content)).toEqual(content)
      })
    })
    describe('with children in it', () => {
      describe('which are paragraphs', () => {
        const content = [
          {
            type: 'numbered-list',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    text: 'Test',
                  },
                ],
              },
            ],
          },
        ]
        it('should change the type of the paragraph', () => {
          const fixed = [
            {
              type: 'numbered-list',
              children: [
                {
                  type: 'list-item',
                  children: [
                    {
                      text: 'Test',
                    },
                  ],
                },
              ],
            },
          ]
          expect(normalize(content)).toEqual(fixed)
        })
      })
      describe('which are list-items', () => {
        const content = [
          {
            type: 'numbered-list',
            children: [
              {
                type: 'list-item',
                children: [
                  {
                    text: 'Test',
                  },
                ],
              },
            ],
          },
        ]
        it('should leave them as-is', () => {
          expect(normalize(content)).toEqual(content)
        })
        describe('which have children which are list items', () => {
          const content = [
            {
              type: 'numbered-list',
              children: [
                {
                  type: 'list-item',
                  children: [
                    {
                      type: 'list-item',
                      children: [
                        {
                          text: 'Test',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ]
          it('should leave them as-is', () => {
            const fixed = [
              {
                type: 'numbered-list',
                children: [
                  {
                    type: 'list-item',
                    children: [
                      {
                        text: 'Test',
                      },
                    ],
                  },
                ],
              },
            ]
            expect(normalize(content)).toEqual(fixed)
          })
        })
      })
    })
  })
  describe('given a paragraph with a value, but a missing type and children', () => {
    const content = {
      name: 'Goal/Want',
      type: 'paragraph',
      value: [
        {
          text: 'live a peaceful Life',
        },
      ],
    }
    it('should add the paragraph and type to their value', () => {
      const fixed = {
        name: 'Goal/Want',
        type: 'paragraph',
        value: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'live a peaceful Life',
              },
            ],
          },
        ],
      }
      expect(normalize(content)).toEqual(fixed)
    })
  })
  describe('given a paragraph with no type', () => {
    const content = [
      {
        children: [
          {
            text: 'XXXXX',
          },
        ],
      },
    ]
    it('should add the paragraph type', () => {
      const fixed = [
        {
          type: 'paragraph',
          children: [
            {
              text: 'XXXXX',
            },
          ],
        },
      ]
      expect(normalize(content)).toEqual(fixed)
    })
  })
})
