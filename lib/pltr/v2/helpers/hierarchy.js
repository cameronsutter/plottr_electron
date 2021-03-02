import { nextColor } from '../../v1/store/lineColors'
import { DASHED, DOTTED, nextBorderStyle, NONE, SOLID } from '../store/borderStyle'
import { hierarchyLevel } from '../store/initialState'

export const borderStyleToCss = (borderStyle) => {
  switch (borderStyle) {
    case NONE:
      return 'none'
    case DASHED:
      return 'dashed'
    case SOLID:
      return 'solid'
    case DOTTED:
      return 'dotted'
    default:
      return 'none'
  }
}

export const hierarchyToStyles = (
  { level, textColor, textSize, borderColor, borderStyle, backgroundColor },
  timelineSize
) => ({
  ...{
    padding: `${Math.floor((75 - textSize) / 2)}px 10px`,
    color: textColor,
    lineHeight: `${textSize}px`,
    border: `2px ${borderStyleToCss(borderStyle)} ${borderColor}`,
    backgroundColor,
  },
  ...(timelineSize === 'large'
    ? {
        fontSize: `${textSize}px`,
      }
    : {}),
})

const LEVEL_NAMES = ['Act', 'Chapter', 'Scene', 'Moment', 'Flit']

export const nextLevelName = (depth) => {
  return LEVEL_NAMES[depth] || `Level-${depth + 1}`
}

export const newHierarchyLevel = (allHierarchyLevels) => {
  return {
    ...hierarchyLevel,
    name: nextLevelName(allHierarchyLevels.length),
    level: allHierarchyLevels.length,
    textColor: nextColor(allHierarchyLevels.length),
    borderColor: nextColor(allHierarchyLevels.length),
    borderStyle: nextBorderStyle(allHierarchyLevels.length),
  }
}
