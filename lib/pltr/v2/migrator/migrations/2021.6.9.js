const { cloneDeep } = require('lodash')

function migrate(data) {
  if (data.file && data.file.version === '2021.6.9') return data

  const obj = cloneDeep(data)

  if (obj.hierarchyLevels) {
    Object.values(obj.hierarchyLevels).forEach((l) => {
      l.dark = {}
      l.light = {}
      l.dark.borderColor = '#c9e6ff'
      l.dark.textColor = '#c9e6ff'
      l.light.borderColor = '#6cace4'
      l.light.textColor = '#6cace4'
    })
  }

  return obj
}

module.exports = migrate
