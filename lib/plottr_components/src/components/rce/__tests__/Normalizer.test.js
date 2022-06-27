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
  describe('given a document where the last root element is an image', () => {
    const exampleFromWild = [
      {
        type: 'paragraph',
        children: [
          {
            text: 'A paragraph',
          },
        ],
      },
      {
        type: 'numbered-list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                text: 'a numbered item,',
              },
            ],
          },
          {
            type: 'list-item',
            children: [
              {
                text: 'another.',
              },
            ],
          },
        ],
      },
      {
        type: 'image-data',
        data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAEOALoDASIAAhEBAxEB/8QAGgABAQEBAQEBAAAAAAAAAAAAAAECAwUEBv/EADwQAAIBAwIEBAMGAwYHAAAAAAABAgMEERIhBSIxQRNRYXEygZEUI6Gx0fAGQsEVJDNSwuEWQ1ODkrLS/8QAGQEBAQEBAQEAAAAAAAAAAAAAAAECAwQF/8QAJREBAQACAgICAgIDAQAAAAAAAAECEQMhEjFBUQQTImEyQnGx/9oADAMBAAIRAxEAPwD8sADzvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKCACggAoIAKCACggAoIAKCACggAoIAKCACggAoIAAAAAAAAAAAAAAAAAAAAMJgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2AAyAAAAAACggAoIAKCZAApGAKCACggAoIAKQBgG+UiXKV+RmL7BfhSojKEMlIAKCAAAGAAQAyop9QnmOPJ4LJ6YmYxb74/qGv8AqxfVfQqJLaOF5l69nt+INfKkc8TUfNBNHOVNNuWp7MsiyT5dQARlQZyZnUUc774Ksm+lc1pz8vmWPNuctOaXqt/c3DfpuFskjWH5lS0jIbIz2hSJ/iGCxcgIBAAAAAwMt8wTEnzGEw3Is3sj7Lyh4FSC6KdGnUXrmCf55PjmuU9r+I6Pg0eGVF/NZ04v3SM26ykdMcZljXkNZ9PUJLsSctMH7HKnPGz77pG5Nucxtju4nJQ1QrVH/LhLbu3+mTes6VIKHD6UMJeJU1P2Eb459uUZNt9ktsiq2oPfsZg+aSx0YqSenHXO2cj5TXbNN8iLVfRee+xmk+X2YrPmXljYvyuv5O0I6Y9um+xJTXnj5Eg+Tbd9TnOb6OKXnsT2mt11jLyeflgk3qkl82RPlQ9uoTXawfVsqeZGM6cxOkFykSxpAAMAAAoIAMzXKZS5cm5rlLbxU6sFNSazuordoslvUbxm2qVpVuIOcI5jhttvCzjpn6HufxBdWt9w+xp29alOrTpqMkpp46H2cMo2nhN3VpUrNPEKijGUItbYUc5XTrjsceK+DOTX2KvUSyk5qK2+oy4svKb+H0ePix1qPC4fZfbqk4VtdOEIpvHVt9PyZ9VXhPDqU9Ne+dOb3xJpEjcU7O2caC0zk3LQ3nSeTT/vFy3VqOT1Zcm+qPXMMZjPtzuOOPWn6Gnwjg9XCqcYpUsvHxRex7H/AAfaX1KlUp8Q1UorMHGKaZ+P4ZYwu+JfeYdCm9dVLZei/fqfouM8bqWnD8U24zqR001/lXmJhL2TGSbeHXpWVDizt6dZVqMZqEpyenvuzbp2VSGrli06ySUs50wWh9e8s+563Cp2lxwuFxUsLR1GpZfgxeWu/Q4cOvaN9UnCdjbU8LKxBPO+/YxeKbZ/W82pb2ivpU6c6fhOjJxfiJZnpbW+fMta2tfC+7nTdSNOElF1NpSxHXvntl7bfgepaSp3HD4XFS3opuDk0qaW/wBDxaN5L7YpzpU3Gaw4+GsJen6kyw8dbZyx127eFZQ8OMpwlH7zxHSqp4w5pacvyUcbb/MitrCOFOrCcPEUZ1IVMPRoi9ST75b2x6H2Xn2e3lHXbUWpT0NqCWOu/T0PN4pZwt5eJRWlPZpdmby4rj6W4a7bowt5UKc6ji9VKTk9eHCabxHT5bL65zsc71UI3tVW2HSjJqLTzqWevU9LhidxYq4rQoaI1PCWaccyxFb9PVHmVJOFe4pqEGnN76VlLscssNY+TOWGsdx82ebfz3O8Xy5OSgtXyOqXKcnDLuKwmSQRGGgQBAMMMKzN9jvYYjXz3Pt4bwG54jio3G3t/wDq1O/su570uF8F4dZVYJutWcWvElLdP07ImP5GHFnPl6MOLK9vGrRdapbKm5Rn4lVJxbWPP8T15/wxCNOEq9TXVmv56jy37nhWtz4N1TlU28OcovPbVvn6n6i4rU7zRUdeVPZao4z9Dl+ZyZ+ep1H1sMbMJlhN+v8AyPyXFLOdpVVObnKDfJJvmhI81z0Rc0kptYSS6Szj9T2f4mvIXFylDGfEz7Hx8IoqVed5VwqFu9nJ4Tn2/X6Hq/HuVxm3H8mS8nT1LGzhZ2Ko1pxh/wAyvlfE/wDL+/UzxPhU7mg7qvqhUe8Vn4F2TXn+p3oypSvqVKam0n4tZSnnV5JeSz29PUl66dt4jVZ1NUcLKxt6/T8x+TzXHKceLXFhdbuPTlwhOHBIQ7rWvxZ8drbVOE06dzfRnSq1KulU31UMPLfz7f7H2WFXVwtTg8fG19WeXZXD4k6NC4nqkquqTxjl0vyPVZuR5s59PVsW1wWksb6GvzPz9DGuDz2SPcspOfBqbb05hJtL3Z5ltQj9kuLiayo+HCHbmcll/Rfic+WWzFy5JuSPs45NaU99qv8ASQlTVxwZVG226Tx6uOV/pOfG393/AN7+kj7FB0uC0oJZk6MnFY7uUmvzR3vXJr+m5N5dsx/u3D+HUM5bhKbS85Zl/wCuk828hpu2+0op/P8AeD776tbUb5a3N+CtFOMU8NfDvt5RPkvo6fDeHlNxf7+RM8d8Vn0nJP46fH4ilLCT/Uqf78jlFuCxyL3Yy1v+2eHTzXH6dyr4jnGo3supuKMudlntQAGQqemX49MkAHeteXNbOu4qPbHxvofXwrhM7vFe6qeFbZ3k3vN+S/U+Gk4RqKVWGpLfTnGTvccQuLjZ1HGCWFGOyS8jNn09OFx951043TtKNzm0bUGsNSblh+Xng8+NxVjTxTqVYw8ovKPRsbWj4f2m7SlH+SMlnU/M8y8VJ15/Z6Ta3eFvpR0wss8a748t/wBenGUalWpClT1yqTklGLWMs/RqNHh1KCbU6Vom1tlTq95fLr84nmcFpOnB3j2lvCl/qf8AT5s+u8tKl9FQVzSoQjvLxFN6n8os9uGGp5L/AG/P1rmpVuJVtclUbzlPp6EqXNar/iVZS92exH+GZuOf7StMdfhq/wDwd7Kwt+E5u51ad1Xhl09MZKFPH8z1JZl5djn+u2+jdk072lvUtuFUqFem4VXBvQ3usttZ8jlY8M/s+VSpO4oVZyhpiqTlsu+cxXkeRayV7dzlc1J5nJ1Kklu9PxSfvjLPvnweELihCpdOEHUnTrSUsqDTisr/AM4fUv7J1uemfLt99tB0OG07apjxFT3Sfwt5eH67nCdtUjY07Ck4VakqilJwbw3ld3jZKJ8i4c6VsqtZTc4RzVp5w09c4fJLR9Wj6K/CYqhN0ajnU16YrGG94du2Ne/k16kvJj9Jc+3a8s1d11TlVVOmqmuc+uI79PNn0znC9ulUpRUbehKOXnZaVyQXm9l9GePOypfboUVOLpVoKpCrLpjS+uO2rbPbBihaePxD7NUlOlCMmsNrEHnSvT4sIt5t3ejzku9LcwuKvEGoU5uc5pU4pZcn0WD7r+jOca9vy69Wdmmk0/NHGPDvvKap1ZwnOk9DTw3V5o6PnKDRKHC6dWkmqiX3SqZbxvqjFw36Pm77dN99s48km9z2ky1bXlyouEXq2a7YNUVzPvt0OkVTjGaaqRqdNMl8O5mXJLK+Z57XG2+lhHEfM6IxjEkl0xk2jLlkAAMqCBgGyw0eItbejq8d0Y69SasbYwGo7XNadxLnelYworokZt/uadSo+r5V7GcEfPiD+CPX1ZqN45X2+aXiT/w9eF0SbWDi51tWNU89MZZ6JNK1Z2z5mpyVv9z5JQuIU9TqT26rLLbt1YyUnJ/M+zB88KXg3G3wyWPYedsJyWyysOg4y1UpaX74OlKnU0YcpRWfhT7mqr0LK6moSTjrWfX0ZnyumfPLSwqzdWD1zzCLjF5w8Z/3ZVKUdlJprLWHjGTk5NVdl16mkk3nutgl37I+JCWVKXkmm1heRGn1i8bYfqjoiT2jldt2vQm+08ra5Oc9a55aY9N+jNR8ScpOcpSztzNvJmpjwtunVG6b1U8l301bZGE8VZa9231NSWY7P0XqJR+9zhf7lS5v3sybS35FF9zaIVEYqggDIJAMDMnyklvjtuXSTZz9g3Gs4j3/AFJF5ySTfXst/cQ+L33BroqJ6dskU4RXc6JnGdN6njoUmr1W3WXbLLGWry+XmfMzpTblhLzyVq4yRusvoZpSztj6G6m+cmKeX0xtusknon+LbitXl2Lh+rX5BLVu9iy2iRnfwaVLf5BJR6FRQzv4fNUjiTS6dcG6PLtt1K+af4EktEvRl26W7mm5LMQny5YT7ftokl+pGf6WL7+ZpGYmgzQABAjKGAMNc/Qu4TDU6JfD7nNPHXOx0aMyjqkFlbjhdO+4bxL3OeXDZr1KpZkvJA0w48zXfr7nSlDTu+/4GsFb0l2XLc041HzYNZUI7GJPMsl0Py/ENa6bU0omJVHLYsafmZksSCTW3SnPO3obRwin1XY6Qn59yJZ9Klzv6mmYb0zNJhL9sw756la5g19TSBsQCAZAABSMADDGTTRGgsqZZpImkoKNEkuXYqAJdManITSwVrG5JvMg1GFF6jsYXxI2DKhJrMSkm+UJPbnB6ZG/hnsIRDXMFta2YYSDDJEpEVAqggCKCAAAADRChoAQACkAYAkvhIGg1CPxG8GUigoZZpkwElOkRFFaCQBBopACKggEAAAAAAAAAAAaGAAGAABBgoAhcAAMEKAICgCAoAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/2Q==',
        children: [
          {
            text: '',
          },
        ],
      },
    ]
    it('should fix that collection', () => {
      const exampleFromWildFixed = [
        {
          type: 'paragraph',
          children: [
            {
              text: 'A paragraph',
            },
          ],
        },
        {
          type: 'numbered-list',
          children: [
            {
              type: 'list-item',
              children: [
                {
                  text: 'a numbered item,',
                },
              ],
            },
            {
              type: 'list-item',
              children: [
                {
                  text: 'another.',
                },
              ],
            },
          ],
        },
        {
          type: 'image-data',
          data: 'data:image/jpeg;base64,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',
          children: [
            {
              text: '',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              text: '',
            },
          ],
        },
      ]
      expect(normalize(dummyLog)(exampleFromWild)).toEqual(exampleFromWildFixed)
    })
  })
  describe('given an empty collection of chilrden, e.g. an empty paragraph', () => {
    const exampleEmptyParagraph = [
      {
        type: 'paragraph',
        children: [],
      },
    ]
    it("shouldn't transform them into lists mistakenly", () => {
      expect(normalize(dummyLog)(exampleEmptyParagraph)).toEqual(exampleEmptyParagraph)
    })
  })
})
