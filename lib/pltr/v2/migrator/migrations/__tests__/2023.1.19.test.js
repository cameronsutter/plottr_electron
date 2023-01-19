import migrate from '../2023.1.19'
import { hierarchyLevel } from '../../../store/initialState'
import {
  pre_2023_1_19,
  pre_2023_1_19_without_hierarchies,
  pre_2023_1_19_with_empty_hierarchies,
} from './fixtures'

const hierarchiesPerBook = {
  series: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
  1: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
  8: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
  5: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
  9: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
  6: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
  7: {
    0: {
      name: 'Act',
      level: 0,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'SOLID',
      backgroundColor: 'none',
      textColor: '#e5554f',
      borderColor: '#e5554f',
      dark: {
        textColor: '#ffb8b5',
        borderColor: '#ffb8b5',
      },
      light: {
        textColor: '#e5554f',
        borderColor: '#e5554f',
      },
    },
    1: {
      name: 'Chapter',
      level: 1,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'DASHED',
      backgroundColor: 'none',
      textColor: '#78be20',
      borderColor: '#78be20',
      dark: {
        textColor: '#baed79',
        borderColor: '#baed79',
      },
      light: {
        textColor: '#78be20',
        borderColor: '#78be20',
      },
    },
    2: {
      name: 'Chapter',
      level: 2,
      autoNumber: true,
      textSize: 24,
      borderStyle: 'NONE',
      backgroundColor: 'none',
      textColor: '#0b1117',
      borderColor: '#6cace4',
      dark: {
        borderColor: '#c9e6ff',
        textColor: '#c9e6ff',
      },
      light: {
        borderColor: '#6cace4',
        textColor: '#0b1117',
      },
    },
  },
}

const defaultHierarchiesPerBook = {
  series: {
    0: hierarchyLevel,
  },
  1: {
    0: hierarchyLevel,
  },
  8: {
    0: hierarchyLevel,
  },
  5: {
    0: hierarchyLevel,
  },
  9: {
    0: hierarchyLevel,
  },
  6: {
    0: hierarchyLevel,
  },
  7: {
    0: hierarchyLevel,
  },
}

describe('2023.1.19', () => {
  describe('given a file with two books', () => {
    describe('and no hierarchies', () => {
      it('should create a hierarchies collection that has a default hierarchy for each book', () => {
        const result = migrate(pre_2023_1_19_without_hierarchies)
        for (const key of Object.keys(result)) {
          if (key === 'hierarchyLevels') {
            expect(result[key]).toEqual(defaultHierarchiesPerBook)
          } else {
            expect(result[key]).toBe(pre_2023_1_19_without_hierarchies[key])
          }
        }
      })
      it('should not apply twice in a row', () => {
        const result1 = migrate(pre_2023_1_19_without_hierarchies)
        expect(migrate(result1)).toBe(result1)
      })
    })
    describe('and empty hierarchies', () => {
      it('should create a hierarchies collection that has a default hierarchy for each book', () => {
        const result = migrate(pre_2023_1_19_with_empty_hierarchies)
        for (const key of Object.keys(result)) {
          if (key === 'hierarchyLevels') {
            expect(result[key]).toEqual(defaultHierarchiesPerBook)
          } else {
            expect(result[key]).toBe(pre_2023_1_19_with_empty_hierarchies[key])
          }
        }
      })
      it('should not apply twice in a row', () => {
        const result1 = migrate(pre_2023_1_19_with_empty_hierarchies)
        expect(migrate(result1)).toBe(result1)
      })
    })
    describe('and an existing hierarchy', () => {
      it('should replace that hierarchy with an arrangement per book that is a copy of the original', () => {
        const result = migrate(pre_2023_1_19)
        for (const key of Object.keys(result)) {
          if (key === 'hierarchyLevels') {
            expect(result[key]).toEqual(hierarchiesPerBook)
          } else {
            expect(result[key]).toBe(pre_2023_1_19[key])
          }
        }
      })
      it('should not apply twice in a row', () => {
        const result1 = migrate(pre_2023_1_19)
        expect(migrate(result1)).toBe(result1)
      })
    })
  })
})
