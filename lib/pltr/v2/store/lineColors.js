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

export function nextBackgroundColor(length) {
  switch (length) {
    case 0:
      return '#6cace419' // blue
    case 1:
      return '#78be2019' // green
    case 2:
      return '#e5554f19' // red
    case 3:
      return '#ff7f3219' // orange
    case 4:
      return '#ffc72c19' // yellow
    default:
      return '#0b111719' // black
  }
}
