export const NONE = 'NONE'
export const DASHED = 'DASHED'
export const SOLID = 'SOLID'
export const DOTTED = 'DOTTED'
export const ALL_STYLES = [NONE, DASHED, SOLID, DOTTED]

export function nextBorderStyle(length) {
  return ALL_STYLES[length % ALL_STYLES.length]
}
