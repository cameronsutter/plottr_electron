const { app } = require('electron')
var fs = require('fs')
var path = require('path')

function Migrator (data, fileName, givenVersion, targetVersion) {
  this.migrate = function (callback) {
    // save a backup file
    fs.writeFile(`${fileName}.backup`, JSON.stringify(this.data, null, 2), (err) => {
      if (err) {
        console.log(err)
        callback('backup', false)
      } else {
        // start migrations
        var migrations = this.getMigrations()
        migrations.forEach((m) => {
          var migration = require(`./migrations/${m}`)
          this.data = migration(this.data)
        })
        this.data.file.version = this.target
        callback(null, this.data)
      }
    })
  }

  this.getMajor = function (versionString) {
    var versionArray = versionString.split('.')
    return parseInt(versionArray[0], 10)
  }

  this.getMinor = function (versionString) {
    var versionArray = versionString.split('.')
    return parseInt(versionArray[1], 10)
  }

  this.areSameVersion = function () {
    if (!this.given) return false
    if (this.given === this.target) {
      return true
    } else {
      if (this.majorGiven === this.majorTarget) {
        // major version is the same
        if (this.minorGiven === this.minorTarget) {
          // minor version is the same
          return true
        }
      }
    }
    return false
  }

  this.noMigrations = function () {
    if (!this.given) return false
    var migrations = this.getMigrations()
    if (migrations.length == 0) return true
    return false
  }

  this.plottrBehindFile = function () {
    return this.majorTarget < this.majorGiven || (this.majorTarget === this.majorGiven && this.minorTarget < this.minorGiven)
  }

  this.getMigrations = function () {
    var files = fs.readdirSync(this.getPath())
    return files.filter((f) => {
      if (!this.given) return true
      var fParts = f.split('.').map(Number)
      if (fParts[0] < this.majorGiven) return false
      if (fParts[0] === this.majorGiven) {
        if (fParts[1] <= this.minorGiven) return false
      }
      return true
    }).sort((a, b) => {
      var aParts = a.split('.').map(Number)
      var bParts = b.split('.').map(Number)

      if (aParts[0] > bParts[0]) return 1
      if (aParts[0] === bParts[0]) {
        if (aParts[1] > bParts[1]) return 1
        return -1
      }
      return -1
    })
  }

  this.getPath = function () {
    var appPath = app.getAppPath()
    return path.resolve(appPath, 'bin', 'migrator', 'migrations')
  }

  this.data = data
  this.given = givenVersion
  this.target = targetVersion
  this.majorGiven = givenVersion ? this.getMajor(this.given) : null
  this.majorTarget = givenVersion ? this.getMajor(this.target) : null
  this.minorGiven = givenVersion ? this.getMinor(this.given) : null
  this.minorTarget = givenVersion ? this.getMinor(this.target) : null
}

module.exports = Migrator
