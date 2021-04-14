import tinycolor from 'tinycolor2'

// returns [useBlack, value]
export const getContrastYIQ = (color) => {
  const brightness = tinycolor(color).getBrightness()
  // >= 125 is the recommended functionality
  return [brightness >= 180, brightness]
}
