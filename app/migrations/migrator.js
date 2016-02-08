import pointFiveToPointSix from './pointFiveToPointSix'

export default class Migrator {
  constructor (data, fromVersion, toVersion) {
    this.data = data
    this.from = fromVersion
    this.to = toVersion
  }

  migrate () {
    var func = this.findFunc()
    return func(this.data)
  }

  findFunc () {
    var fromVersion = this.getMajorMinor(this.from)
    var toVersion = this.getMajorMinor(this.to)
    var version = `${fromVersion}To${toVersion}`
    var result = null
    switch (version) {
      case '0.5To0.6':
        result = pointFiveToPointSix
        break
      default:
        result = function (data) {
          return data
        }
        break
    }
    return result
  }

  getMajorMinor (versionString) {
    var n = versionString.lastIndexOf('.')
    return versionString.substring(0, n)
  }
}
