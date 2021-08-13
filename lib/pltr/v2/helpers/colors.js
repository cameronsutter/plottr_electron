import tinycolor from 'tinycolor2'

const defaultLightModeText = '#0b1117'
const defaultDarkModeText = '#eee'

const defaultLightBackground = '#F1F5F8' //gray-9
const defaultDarkBackground = '#666'

const defaultLightBorder = '#F1F5F8' //gray-9
const defaultDarkBorder = '#c9e6ff'

// returns [useBlack, value]
export const getContrastYIQ = (color) => {
  const brightness = tinycolor(color).getBrightness()
  // >= 125 is the recommended functionality
  return [brightness >= 180, brightness]
}

export const getTextColor = (color, isDarkMode) => {
  if (color && color !== 'none') return color

  return isDarkMode ? defaultDarkModeText : defaultLightModeText
}

export const getBackgroundColor = (color, isDarkMode) => {
  if (color && color !== 'none') return color

  return isDarkMode ? defaultDarkBackground : defaultLightBackground
}

export const getBorderColor = (color, isDarkMode) => {
  if (color && color !== 'none') return color

  return isDarkMode ? defaultDarkBorder : defaultLightBorder
}
