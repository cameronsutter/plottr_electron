export const NONE = 'NONE'
export const DASHED = 'DASHED'
export const SOLID = 'SOLID'

export function nextBorderStyle(length) {
  switch (length) {
    case 0:
      return NONE
    case 1:
      return DASHED
    case 2:
      return SOLID
  }
}
