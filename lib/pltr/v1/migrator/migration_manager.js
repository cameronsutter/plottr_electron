const Migrator = require('./migrator')

// callback(error, migrated?, data)
function migrateIfNeeded(appVersion, json, fileName, backupFunction, callback) {
  if (!json.file) {
    callback(null, false, json)
    return
  }
  var m = new Migrator(json, fileName, json.file.version, appVersion, backupFunction)
  if (m.needsToMigrate()) {
    if (m.plottrBehindFile()) {
      callback('Plottr behind file', false, json)
    } else {
      m.migrate((err, json) => {
        if (err === 'backup') {
          // try again
          m.migrate((err, json) => {
            if (err === 'backup') {
              // open without migrating
              callback('problem saving backup', false, json)
            } else {
              // save it and open
              callback(null, true, json)
            }
          })
        } else {
          // save it and open
          callback(null, true, json)
        }
      })
    }
  } else {
    callback(null, false, json)
  }
}

module.exports = migrateIfNeeded
