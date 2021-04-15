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

export function nextDarkColor(length) {
  switch (length) {
    case 0:
      return '#c9e6ff'
    case 1:
      return '#baed79'
    case 2:
      return '#ffb8b5'
    case 3:
      return '#ffac7a'
    case 4:
      return '#fff373'
    default:
      return '#d4d4d4'
  }
}

export function lightBackground(color) {
  return tinycolor(color).setAlpha(0.1).toHslString()
}
