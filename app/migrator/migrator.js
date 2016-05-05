import fs from 'fs'
import path from 'path'

export default class Migrator {
  constructor (data, givenVersion, targetVersion) {
    this.data = data
    this.given = givenVersion
    this.target = targetVersion
    this.majorGiven = this.getMajor(this.given)
    this.majorTarget = this.getMajor(this.target)
    this.minorGiven = this.getMinor(this.given)
    this.minorTarget = this.getMinor(this.target)
  }

  migrate (callback) {
    // save a backup file
    var backupName = this.data.file.fileName.replace('.plottr', '.backup.plottr')
    fs.writeFile(backupName, JSON.stringify(this.data), (err) => {
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
        callback(null, this.data)
      }
    })
  }

  getMajor (versionString) {
    var versionArray = versionString.split('.')
    return parseInt(versionArray[0], 10)
  }

  getMinor (versionString) {
    var versionArray = versionString.split('.')
    return parseInt(versionArray[1], 10)
  }

  areSameVersion () {
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

  plottrBehindFile () {
    return this.majorTarget < this.majorGiven || (this.majorTarget === this.majorGiven && this.minorTarget < this.minorGiven)
  }

  getMigrations () {
    var files = fs.readdirSync(path.resolve(process.cwd(), 'app', 'migrator', 'migrations'))
    return files.filter((f) => {
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
}
