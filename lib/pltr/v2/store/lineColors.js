import tinycolor from 'tinycolor2'

export function nextColor(length) {
  switch (length) {
    case 0:
      return '#6cace4' // blue
    case 1:
      return '#78be20' // green
    case 2:
      return '#e5554f' // red
    case 3:
      return '#ff7f32' // orange
    case 4:
      return '#ffc72c' // yellow
    default:
      return '#0b1117' // black
  }
}

export function lightBackground(color) {
  return tinycolor(color).setAlpha(0.1).toHslString()
}
