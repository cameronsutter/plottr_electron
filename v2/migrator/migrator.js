import semverGt from 'semver/functions/gt'
import semverEq from 'semver/functions/eq'
import semverCoerce from 'semver/functions/coerce'
import migrationsList from './migrations_list'
import migrators from './migrations'

export default function Migrator(data, fileName, fileVersion, appVersion, backupFunction) {
  this.data = data
  this.fileVersion = fileVersion
  this.appVersion = appVersion
  this.migrations = []
  this.migrationsChecked = false
  this.backupFunction = backupFunction

  this.migrate = function (callback) {
    // save a backup file
    if (this.backupFunction) {
      this.backupFunction(
        `${fileName.replace('.pltr', '')}-${this.fileVersion}-backup.pltr`,
        JSON.stringify(this.data, null, 2),
        (err) => {
          if (err) {
            console.log(err)
            callback('backup', false)
          } else {
            this.startMigrations(callback)
          }
        }
      )
    } else {
      this.startMigrations(callback)
    }
  }

  this.startMigrations = function (callback) {
    let migrations = this.getMigrations()
    migrations.forEach((m) => {
      this.data = migrators[m](this.data)
    })
    this.data.file.version = this.appVersion
    callback(null, this.data)
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

    this.migrations = migrationsList.filter((version) => {
      if (!this.fileVersion) return true
      const usableVersionString = version.replace('m', '').replace(/_/g, '.')
      return semverGt(semverCoerce(usableVersionString), this.fileVersion)
    })
    this.migrationsChecked = true
    return this.migrations
  }
}
