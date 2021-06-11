import { nextColor, nextDarkColor } from '../../v2/store/lineColors'
import { DASHED, DOTTED, nextBorderStyle, NONE, SOLID } from '../store/borderStyle'
import { hierarchyLevel } from '../store/initialState'
import { t } from 'plottr_locales'

import { getTextColor } from './colors'

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

const nullIfNone = (color) => (color === 'none' ? null : color)

const noneIsTransparent = (borderStyle, borderColor) => {
  return borderStyle === NONE || borderColor === 'none' ? 'transparent' : borderColor
}

export const hierarchyToStyles = (
  { level, textSize, borderStyle, backgroundColor },
  timelineSize,
  hovering,
  theme,
  isDarkMode
) => ({
  ...{
    color: nullIfNone(getTextColor(theme.textColor, isDarkMode)),
    lineHeight: `${textSize}px`,
    backgroundColor: nullIfNone(backgroundColor),
  },
  ...(!hovering
    ? {
        border: `3px ${borderStyleToCss(borderStyle)} ${noneIsTransparent(
          borderStyle,
          theme.borderColor
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

const LEVEL_NAMES = [t('Scene'), t('Chapter'), t('Act')]

export const nextLevelName = (depth) => {
  return LEVEL_NAMES[depth] || `Level-${depth + 1}`
}

export const newHierarchyLevel = (allHierarchyLevels) => {
  return {
    ...hierarchyLevel,
    name: nextLevelName(allHierarchyLevels.length),
    level: 0,
    borderStyle: nextBorderStyle(allHierarchyLevels.length),
    textColor: nextColor(allHierarchyLevels.length),
    borderColor: nextColor(allHierarchyLevels.length),
    dark: {
      textColor: nextDarkColor(allHierarchyLevels.length),
      borderColor: nextDarkColor(allHierarchyLevels.length),
    },
    light: {
      textColor: nextColor(allHierarchyLevels.length),
      borderColor: nextColor(allHierarchyLevels.length),
    },
  }
}
