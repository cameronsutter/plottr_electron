const { app } = require('electron')
var fs = require('fs')
var path = require('path')
const semverGt = require('semver/functions/gt')
const semverEq = require('semver/functions/eq')
const semverCoerce = require('semver/functions/coerce')

function Migrator (data, fileName, fileVersion, appVersion) {
  this.migrate = function (callback) {
    // save a backup file
    fs.writeFile(`${fileName.replace('.pltr', '')}-${this.fileVersion}-backup.pltr`, JSON.stringify(this.data, null, 2), (err) => {
      if (err) {
        console.log(err)
        callback('backup', false)
      } else {
        // start migrations
        let migrations = this.getMigrations()
        migrations.forEach(m => {
          var migration = require(`./migrations/${m}`)
          this.data = migration(this.data)
        })
        this.data.file.version = this.appVersion
        callback(null, this.data)
      }
    })
  }

  this.areDifferentVersions = function () {
    if (!this.fileVersion) return false
    return !semverEq(this.fileVersion, this.appVersion)
  }

  this.needsToMigrate = function () {
    if (!this.fileVersion) return false
    return this.areDifferentVersions() && this.getMigrations().length
  }

  this.plottrBehindFile = function () {
    return semverGt(this.fileVersion, this.appVersion) // file version is greater than app
  }

  this.getMigrations = function () {
    if (this.migrationsChecked) {
      return this.migrations
    }

    let files = fs.readdirSync(this.getPath())
    this.migrations = files.filter((f) => {
      if (!this.fileVersion) return true
      const fileName = f.replace('.js', '')
      return semverGt(semverCoerce(fileName), this.fileVersion)
    }).sort((a, b) => {
      let aVersion = a.replace('.js', '')
      let bVersion = b.replace('.js', '')
      return semverGt(semverCoerce(aVersion), semverCoerce(bVersion)) ? 1 : -1
    })
    this.migrationsChecked = true
    return this.migrations
  }

  this.getPath = function () {
    var appPath = app.getAppPath()
    return path.resolve(appPath, 'bin', 'migrator', 'migrations')
  }

  this.data = data
  this.fileVersion = fileVersion
  this.appVersion = appVersion
  this.migrations = []
  this.migrationsChecked = false
}

module.exports = Migrator
