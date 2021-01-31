// if it returns true, use black
export const getContrastYIQ = (str) => {
  let hex
  if (str[0] == '#') {
    // if it's a hex code
    hex = str.replace('#', '')
  } else {
    // if it's a css color name
    hex = colorNameToHex(str).replace('#', '')
  }
  const [r, g, b] = [0, 2, 4].map((p) => parseInt(hex.substr(p, 2), 16))
  const val = (r * 299 + g * 587 + b * 114) / 1000
  // this comment is the recommended functionality (>= 125)
  // return [val >= 125, val]
  return [val >= 180, val]
}

export const colorNameToHex = (name) => {
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.fillStyle = name
  return ctx.fillStyle
}
