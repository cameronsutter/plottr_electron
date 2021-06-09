import tinycolor from 'tinycolor2'

const defaultLightModeText = '#0b1117'
const defaultDarkModeText = '#eee'

// returns [useBlack, value]
export const getContrastYIQ = (color) => {
  const brightness = tinycolor(color).getBrightness()
  // >= 125 is the recommended functionality
  return [brightness >= 180, brightness]
}

export const getTextColor = (color, isDarkMode) => {
  if (color !== 'none') return color

  return isDarkMode ? defaultDarkModeText : defaultLightModeText
}
