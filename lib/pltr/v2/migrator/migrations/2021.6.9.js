const { cloneDeep } = require('lodash')
const { nextColor, nextDarkColor } = require('../../store/lineColors')

function migrate(data) {
  if (data.file && data.file.version === '2021.6.9') return data

  const obj = cloneDeep(data)

  if (obj.hierarchyLevels) {
    Object.values(obj.hierarchyLevels).forEach((l) => {
      l.dark = {}
      l.light = {}
      l.dark.borderColor = nextDarkColor(0)
      l.dark.textColor = nextDarkColor(0)
      l.light.borderColor = nextColor(0)
      l.light.textColor = nextColor('default')
    })
  }

  return obj
}

module.exports = migrate
