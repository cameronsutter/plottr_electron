import { cloneDeep, difference, first, last } from 'lodash'
import semverGt from 'semver/functions/gt'
import migrationsList from './migrations_list'
import migrators from './migrations'
import { toSemver } from './toSemver'

export default function Migrator(data, fileName, fileVersion, appVersion, backupFunction) {
  this.data = cloneDeep(data)
  this.fileVersion = fileVersion
  this.appVersion = appVersion
  this.migrations = []
  this.migrationsChecked = false
  this.backupFunction = backupFunction

  if (!this.data.file.initialVersion) {
    this.data.file.initialVersion = this.fileVersion
  }

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
      if (!this.data.file.appliedMigrations) {
        this.data.file.appliedMigrations = []
      }
      this.data.file.appliedMigrations.push(m)
    })
    this.data.file.version = this.appVersion
    callback(null, this.data)
  }

  this.needsToMigrate = function () {
    if (!this.fileVersion) return false
    return this.getMigrations().length
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
      const initialVersion = this.data.file.initialVersion
      return semverGt(toSemver(version), initialVersion)
    })
    const appliedMigrations = this.data.file.appliedMigrations
    this.migrations = difference(this.migrations, appliedMigrations)
    if (appliedMigrations && appliedMigrations.length && this.migrations.length) {
      const latestAppliedMigration = toSemver(last(appliedMigrations))
      const firstMigrationToApply = toSemver(first(this.migrations))
      if (semverGt(latestAppliedMigration, firstMigrationToApply)) {
        throw new Error(
          `Can't migrate from version ${latestAppliedMigration} to version
${firstMigrationToApply}`
        )
      }
    }
    this.migrationsChecked = true
    return this.migrations
  }
}
