const { app, dialog } = require('electron')
const Migrator = require('./migrator/migrator')
const log = require('electron-log')

// callback(error, migrated?, data)
function migrateIfNeeded (json, fileName, callback) {
  if (!json.file) {
    callback(null, false, json)
    return
  }
  const appVersion = app.getVersion()
  var m = new Migrator(json, fileName, json.file.version, appVersion)
  if (m.needsToMigrate()) {
    log.info('needs to migrate', json.file.version, appVersion)
    if (m.plottrBehindFile()) {
      dialog.showErrorBox(i18n('Update Plottr'), i18n("It looks like your file was saved with a newer version of Plottr than you're using now. That could cause problems. Try updating Plottr and starting it again."))
      callback('Plottr behind file', false, json)
    } else {
      log.info('migrating')
      m.migrate((err, json) => {
        if (err === 'backup') {
          log.warn('error saving backup')
          // try again
          m.migrate((err, json) => {
            if (err === 'backup') {
              log.warn('error saving backup again. Open without migrating')
              // open without migrating
              callback('problem saving backup', false, json)
            } else {
              // save it and open
              log.info('finished migrating. Save it and open')
              callback(null, true, json)
            }
          })
        } else {
          // save it and open
          log.info('finished migrating. Save it and open')
          callback(null, true, json)
        }
      })
    }
  } else {
    callback(null, false, json)
  }
}

module.exports = migrateIfNeeded