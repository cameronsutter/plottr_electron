import { emptyFile } from 'pltr/v2'
import default_export_config from '../../../default_config'

import { goldilocks } from './fixtures'
import { characterDataExportDirectives, interpret } from '../characters'

const EMPTY_FILE = emptyFile('Test file')

describe('characterDataExportDirectives', () => {
  describe('given an empty new file', () => {
    it('should produce an empty category', () => {
      expect(characterDataExportDirectives(EMPTY_FILE, default_export_config.word)).toEqual([
        { alignment: 'center', heading: 'Heading1', type: 'paragraph', text: 'Characters' },
      ])
    })
    describe('with characters turned off', () => {
      it('should not export anything', () => {
        expect(
          characterDataExportDirectives(EMPTY_FILE, {
            ...default_export_config.word,
            characters: {
              ...default_export_config.word.characters,
              export: false,
            },
          })
        ).toEqual([])
      })
    })
  })
  describe('given the goldilocks example file', () => {
    describe('which does not have characters associated to books', () => {
      describe('nor does it have multiple books', () => {
        it('should nevertheless export all characters as though they were all associated with the only book', () => {
          expect(characterDataExportDirectives(goldilocks, default_export_config.word)).toEqual([
            { alignment: 'center', heading: 'Heading1', type: 'paragraph', text: 'Characters' },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading2',
              text: 'Goldilocks',
              type: 'paragraph',
            },
            {
              imageId: '1',
              type: 'image-paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Description',
              type: 'paragraph',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Category',
              type: 'paragraph',
            },
            {
              text: 'Main',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Notes',
              type: 'paragraph',
            },
            {
              data: undefined,
              type: 'rce',
            },
            {
              data: [
                {
                  name: 'Species',
                  type: 'text',
                  value: 'Human',
                },
              ],
              type: 'custom-atttributes',
            },
            {
              character: {
                Species: 'Human',
                bookIds: [],
                cards: [1, 2, 6, 7, 3, 4, 5, 11],
                categoryId: '1',
                color: null,
                description: '',
                id: 1,
                imageId: '1',
                name: 'Goldilocks',
                noteIds: [],
                notes: [
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                  },
                ],
                tags: [],
                templates: [],
              },
              type: 'templates',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading2',
              text: 'Baby Bear',
              type: 'paragraph',
            },
            {
              imageId: '2',
              type: 'image-paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Description',
              type: 'paragraph',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Category',
              type: 'paragraph',
            },
            {
              text: 'Main',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Notes',
              type: 'paragraph',
            },
            {
              data: undefined,
              type: 'rce',
            },
            {
              data: [
                {
                  name: 'Species',
                  type: 'text',
                  value: 'Bear',
                },
              ],
              type: 'custom-atttributes',
            },
            {
              character: {
                Species: 'Bear',
                bookIds: [],
                cards: [3, 4, 11],
                categoryId: '1',
                color: null,
                description: '',
                id: 2,
                imageId: '2',
                name: 'Baby Bear',
                noteIds: [],
                notes: [
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                  },
                ],
                tags: [],
                templates: [],
              },
              type: 'templates',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading2',
              text: 'Papa Bear',
              type: 'paragraph',
            },
            {
              imageId: '4',
              type: 'image-paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Description',
              type: 'paragraph',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Category',
              type: 'paragraph',
            },
            {
              text: 'Supporting',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Notes',
              type: 'paragraph',
            },
            {
              data: undefined,
              type: 'rce',
            },
            {
              data: [
                {
                  name: 'Species',
                  type: 'text',
                  value: 'Bear',
                },
              ],
              type: 'custom-atttributes',
            },
            {
              character: {
                Species: 'Bear',
                bookIds: [],
                cards: [3, 4, 11],
                categoryId: '2',
                color: null,
                description: '',
                id: 3,
                imageId: '4',
                name: 'Papa Bear',
                noteIds: [],
                notes: [
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                  },
                ],
                tags: [],
                templates: [],
              },
              type: 'templates',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading2',
              text: 'Mama Bear',
              type: 'paragraph',
            },
            {
              imageId: '3',
              type: 'image-paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Description',
              type: 'paragraph',
            },
            {
              text: '',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Category',
              type: 'paragraph',
            },
            {
              text: 'Supporting',
              type: 'paragraph',
            },
            {
              heading: 'Heading3',
              text: 'Notes',
              type: 'paragraph',
            },
            {
              data: undefined,
              type: 'rce',
            },
            {
              data: [
                {
                  name: 'Species',
                  type: 'text',
                  value: 'Bear',
                },
              ],
              type: 'custom-atttributes',
            },
            {
              character: {
                Species: 'Bear',
                bookIds: [],
                cards: [3, 4, 11],
                categoryId: '2',
                color: null,
                description: '',
                id: 4,
                imageId: '3',
                name: 'Mama Bear',
                noteIds: [],
                notes: [
                  {
                    children: [
                      {
                        text: '',
                      },
                    ],
                  },
                ],
                tags: [],
                templates: [],
              },
              type: 'templates',
            },
          ])
        })
      })
    })
  })
})

describe('interpret', () => {
  describe('given an empty array', () => {
    it('should produce an empty array', () => {
      expect(interpret([], {}, default_export_config.word)).toEqual([])
    })
  })
  describe('given an array created from the goldilocks file', () => {
    it('should contain the correct docx elements', () => {
      const directives = characterDataExportDirectives(goldilocks, default_export_config.word)
      const interpretted = interpret(directives, {})
      // There's other stuff in there and it's difficult to verify it all.
      expect(JSON.parse(JSON.stringify(interpretted))).toEqual([
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading1"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                },
                {
                  "rootKey": "w:jc",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "center"
                      },
                      "xmlKeys": {
                        "val": "w:val"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Characters"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading1"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              },
              {
                "rootKey": "w:jc",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "center"
                    },
                    "xmlKeys": {
                      "val": "w:val"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading2"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Goldilocks"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading2"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Description"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Category"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Main"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Notes"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Species"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Human"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading2"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Baby Bear"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading2"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Description"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Category"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Main"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Notes"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Species"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Bear"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading2"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Papa Bear"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading2"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Description"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Category"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Supporting"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Notes"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Species"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Bear"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading2"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Mama Bear"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading2"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Description"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Category"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Supporting"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Notes"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [
                {
                  "rootKey": "w:pStyle",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "val": "Heading3"
                      },
                      "xmlKeys": {
                        "val": "w:val",
                        "color": "w:color",
                        "fill": "w:fill",
                        "space": "w:space",
                        "sz": "w:sz",
                        "type": "w:type",
                        "rsidR": "w:rsidR",
                        "rsidRPr": "w:rsidRPr",
                        "rsidSect": "w:rsidSect",
                        "w": "w:w",
                        "h": "w:h",
                        "top": "w:top",
                        "right": "w:right",
                        "bottom": "w:bottom",
                        "left": "w:left",
                        "header": "w:header",
                        "footer": "w:footer",
                        "gutter": "w:gutter",
                        "linePitch": "w:linePitch",
                        "pos": "w:pos"
                      }
                    }
                  ]
                }
              ],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Species"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [
              {
                "rootKey": "w:pStyle",
                "root": [
                  {
                    "rootKey": "_attr",
                    "root": {
                      "val": "Heading3"
                    },
                    "xmlKeys": {
                      "val": "w:val",
                      "color": "w:color",
                      "fill": "w:fill",
                      "space": "w:space",
                      "sz": "w:sz",
                      "type": "w:type",
                      "rsidR": "w:rsidR",
                      "rsidRPr": "w:rsidRPr",
                      "rsidSect": "w:rsidSect",
                      "w": "w:w",
                      "h": "w:h",
                      "top": "w:top",
                      "right": "w:right",
                      "bottom": "w:bottom",
                      "left": "w:left",
                      "header": "w:header",
                      "footer": "w:footer",
                      "gutter": "w:gutter",
                      "linePitch": "w:linePitch",
                      "pos": "w:pos"
                    }
                  }
                ]
              }
            ],
            "numberingReferences": []
          }
        },
        {
          "rootKey": "w:p",
          "root": [
            {
              "rootKey": "w:pPr",
              "root": [],
              "numberingReferences": []
            },
            {
              "rootKey": "w:r",
              "root": [
                {
                  "rootKey": "w:rPr",
                  "root": []
                },
                {
                  "rootKey": "w:t",
                  "root": [
                    {
                      "rootKey": "_attr",
                      "root": {
                        "space": "preserve"
                      },
                      "xmlKeys": {
                        "space": "xml:space"
                      }
                    },
                    "Bear"
                  ]
                }
              ],
              "properties": {
                "rootKey": "w:rPr",
                "root": []
              }
            }
          ],
          "properties": {
            "rootKey": "w:pPr",
            "root": [],
            "numberingReferences": []
          }
        }
      ])
    })
  })
})
