import Migrator from './migrator'
import applyAllFixes from './handleSpecialCases'

// callback(error, migrated?, data)
export default function migrateIfNeeded(appVersion, json, fileName, backupFunction, callback, log) {
  if (!json.file) {
    callback(null, false, json)
    return
  }
  const fileVersion = json.file.version
  const withSpecialCasesFixed = applyAllFixes(json)
  const migrator = new Migrator(
    withSpecialCasesFixed,
    fileName,
    fileVersion,
    appVersion,
    backupFunction,
    log
  )
  if (migrator.needsToMigrate()) {
    if (migrator.plottrBehindFile()) {
      callback('Plottr behind file', false, withSpecialCasesFixed)
    } else {
      migrator.migrate((err, withSpecialCasesFixed) => {
        if (err === 'backup') {
          // try again
          migrator.migrate((err, withSpecialCasesFixed) => {
            if (err === 'backup') {
              // open without migrating
              callback('problem saving backup', false, withSpecialCasesFixed)
            } else {
              // save it and open
              callback(null, true, withSpecialCasesFixed)
            }
          })
        } else {
          // save it and open
          callback(null, true, withSpecialCasesFixed)
        }
      })
    }
  } else {
    callback(null, false, withSpecialCasesFixed)
  }
}
