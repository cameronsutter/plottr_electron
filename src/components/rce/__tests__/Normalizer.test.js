import { normalize } from '../Normalizer'

const dummyLog = {
  info: () => {},
  warn: () => {},
  error: () => {},
}

describe('normalize', () => {
  describe('given empty content', () => {
    it('should produce empty content', () => {
      expect(normalize(dummyLog)([])).toEqual([])
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
      expect(normalize(dummyLog)(content)).toEqual(content)
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
      expect(normalize(dummyLog)(content)).toEqual(singlyNestedContent)
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
      expect(normalize(dummyLog)(content)).toEqual(singlyNestedContent)
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
      expect(normalize(dummyLog)(content)).toEqual(fixed)
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
      expect(normalize(dummyLog)(content)).toEqual(content)
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
        expect(normalize(dummyLog)(content)).toEqual(content)
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
          expect(normalize(dummyLog)(content)).toEqual(fixed)
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
          expect(normalize(dummyLog)(content)).toEqual(content)
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
            expect(normalize(dummyLog)(content)).toEqual(fixed)
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
    // TODO: follow up with Cameron re this one.  The Slate serialiser
    // doesnt handle this case.
    it.skip('should add the paragraph and type to their value', () => {
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
      expect(normalize(dummyLog)(content)).toEqual(fixed)
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
      expect(normalize(dummyLog)(content)).toEqual(fixed)
    })
  })
  describe('given a collection of top-level list-items', () => {
    const topLevelListItems = [
      {
        type: 'list-item',
        children: [
          {
            text: 'Offer clues which hint at the both the physical and',
          },
        ],
      },
      {
        type: 'list-item',
        children: [
          {
            text: 'Include clues which will point the Sleuth in the ',
          },
        ],
      },
      {
        type: 'list-item',
        children: [
          {
            text: "Do not reveal too much of the Sleuth's character, as",
          },
        ],
      },
    ]
    it('should embed them into a bulleted list', () => {
      const expectedNormalisedContent = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [
                {
                  text: 'Offer clues which hint at the both the physical and',
                },
              ],
            },
            {
              type: 'list-item',
              children: [
                {
                  text: 'Include clues which will point the Sleuth in the ',
                },
              ],
            },
            {
              type: 'list-item',
              children: [
                {
                  text: "Do not reveal too much of the Sleuth's character, as",
                },
              ],
            },
          ],
        },
      ]
      expect(normalize(dummyLog)(topLevelListItems)).toEqual(expectedNormalisedContent)
    })
  })
  describe('given a collection of list-items inside another path in the tree', () => {
    const embeddedListItems = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'list-item',
            children: [
              {
                text: 'Offer clues which hint at the both the physical and',
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                text: 'Include clues which will point the Sleuth in the ',
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                text: "Do not reveal too much of the Sleuth's character, as",
              },
            ],
          },
        ],
      },
    ]
    it('should embed them into a bulleted list', () => {
      const expectedNormalisedContent = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [
                {
                  text: 'Offer clues which hint at the both the physical and',
                },
              ],
            },
            {
              type: 'list-item',
              children: [
                {
                  text: 'Include clues which will point the Sleuth in the ',
                },
              ],
            },
            {
              type: 'list-item',
              children: [
                {
                  text: "Do not reveal too much of the Sleuth's character, as",
                },
              ],
            },
          ],
        },
      ]
      expect(normalize(dummyLog)(embeddedListItems)).toEqual(expectedNormalisedContent)
    })
  })
  describe('given a collection of bare list items found in the wild', () => {
    const exampleFromWild = [
      {
        type: 'list-item',
        children: [
          {
            text: 'Capture Readers Interest',
          },
        ],
      },
      {
        type: 'list-item',
        children: [
          {
            text: 'Introduce Characters.',
          },
          {
            text: '',
          },
        ],
      },
    ]
    it('should fix that collection', () => {
      const exampleFromWildFixed = [
        {
          type: 'bulleted-list',
          children: [
            {
              type: 'list-item',
              children: [
                {
                  text: 'Capture Readers Interest',
                },
              ],
            },
            {
              type: 'list-item',
              children: [
                {
                  text: 'Introduce Characters.',
                },
              ],
            },
          ],
        },
      ]
      expect(normalize(dummyLog)(exampleFromWild)).toEqual(exampleFromWildFixed)
    })
  })
})
