import { cloneDeep, difference, first, last } from 'lodash'
import semverGt from 'semver/functions/gt'
import semverLte from 'semver/functions/lte'
import migrationsList from './migrations_list'
import migrators from './migrations'
import { toSemver } from './toSemver'
import { withoutProtocol } from '../helpers/file'

export default function Migrator(data, fileURL, fileVersion, appVersion, backupFunction, logger) {
  const logError = (...args) => (logger ? logger.error(...args) : console.error(...args))

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
        `${withoutProtocol(fileURL).replace('.pltr', '')}-${this.fileVersion}-backup.pltr`,
        JSON.stringify(this.data, null, 2),
        (err) => {
          if (err) {
            logError(err)
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
      const cleaned = m.replace('*', '')
      this.data = migrators[cleaned](this.data)
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
    // file version is greater than app
    if (semverGt(this.fileVersion, this.appVersion)) {
      // check if the file has a breaking migration that is ahead of the current version
      const appliedMigrations = this.data.file.appliedMigrations || []
      const breakingMigrations = appliedMigrations.filter((mig) => mig.includes('*'))
      return breakingMigrations.some((mig) => semverGt(toSemver(mig), this.appVersion))
    } else {
      return false
    }
  }

  this.getMigrations = function () {
    if (this.migrationsChecked) {
      return this.migrations
    }

    this.migrations = migrationsList.filter((version) => {
      if (!this.fileVersion) return true
      const initialVersion = this.data.file.initialVersion
      const semVerVersion = toSemver(version)
      return semverLte(semVerVersion, this.appVersion) && semverGt(semVerVersion, initialVersion)
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
