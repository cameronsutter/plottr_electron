const { cloneDeep } = require('lodash')

export function backgroundColorFrom(lineColor) {
  switch (lineColor) {
    case '#6cace4':
      return '#6cace419' // blue
    case '#78be20':
      return '#78be2019' // green
    case '#e5554f':
      return '#e5554f19' // red
    case '#ff7f32':
      return '#ff7f3219' // orange
    case '#ffc72c':
      return '#ffc72c19' // yellow
    default:
      return '#0b111719' // black
  }
}

function migrate (data) {
  if (data.file && data.file.version === '2021.1.23') return data

  let obj = cloneDeep(data)

  obj.lines.forEach(
    (line) => (line.backgroundColor = line.backgroundColor || backgroundColorFrom(line.color))
  )

  return obj
}

export default migrate
