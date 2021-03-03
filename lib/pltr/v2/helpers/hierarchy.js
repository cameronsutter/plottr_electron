import { nextColor } from '../../v1/store/lineColors'
import { DASHED, DOTTED, nextBorderStyle, NONE, SOLID } from '../store/borderStyle'
import { hierarchyLevel } from '../store/initialState'

export const borderStyleToCss = (borderStyle) => {
  switch (borderStyle) {
    case NONE:
      return 'solid'
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

const noneIsTransparent = (borderStyle, borderColor) => {
  return borderStyle === NONE ? 'transparent' : borderColor
}

export const hierarchyToStyles = (
  { level, textColor, textSize, borderColor, borderStyle, backgroundColor },
  timelineSize,
  hovering
) => ({
  ...{
    color: textColor,
    lineHeight: `${textSize}px`,
    backgroundColor,
  },
  ...(!hovering
    ? {
        border: `3px ${borderStyleToCss(borderStyle)} ${noneIsTransparent(
          borderStyle,
          borderColor
        )}`,
      }
    : {}),
  ...(timelineSize === 'large'
    ? {
        fontSize: `${textSize}px`,
        padding: `${Math.floor((75 - textSize) / 2)}px 10px`,
      }
    : {}),
})

const LEVEL_NAMES = ['Scene', 'Chapter', 'Act']

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
