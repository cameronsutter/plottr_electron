const { cloneDeep } = require('lodash')
const { t } = require('plottr_locales')
const { nextColor } = require('../../store/lineColors')

function migrate(data) {
  if (data.file && data.file.version === '2021.8.1') return data

  const obj = cloneDeep(data)

  // if act structure hasn't been used
  // (meaning act structure is off && only 1 hierarchy level)
  if (obj.hierarchyLevels) {
    const flagIsOff = obj.featureFlags ? !obj.featureFlags.BEAT_HIERARCHY : true
    if (flagIsOff && Object.keys(obj.hierarchyLevels).length == 1) {
      obj.hierarchyLevels['0'].name = t('Chapter')
      obj.hierarchyLevels['0'].light.textColor = nextColor('default')
    }
  }

  return obj
}

module.exports = migrate
