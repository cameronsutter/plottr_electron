const padTo = (str, length) => {
  let result = str
  for (let i = 0; i < length - str.length; ++i) {
    result = result + ' '
  }
  return result
}

const stringifiedSideBySide = (object1, object2) => {
  const str1 = JSON.stringify(object1, null, 2)
  const str2 = JSON.stringify(object2, null, 2)
  const longestLine = `${str1}\n${str2}`
    .split('\n')
    .map((x) => x.length)
    .reduce((longest, next) => Math.max(longest, next), 0)
  const lines1 = str1.split('\n')
  const lines2 = str2.split('\n')

  let result = ''
  for (let l = 0; l < Math.max(lines1.length, lines2.length); ++l) {
    const line1 = lines1[l] || ''
    const paddedLine1 = padTo(line1, longestLine)
    const line2 = lines2[l] || ''
    const changeIndicator = line1 !== line2 ? '*' : ' '
    result = result + `\n${paddedLine1} |${changeIndicator}${line2}`
  }
  return result
}

const logChange =
  (dryRun) =>
  (database, executingUserId, scriptName, runDate) =>
  (userId, fileId, collectionName, oldRecord, newRecord) => {
    if (dryRun) {
      console.log('Dry run mode.  Logging changes to console.')
      console.log('Old ==> New')
      console.log(stringifiedSideBySide(oldRecord, newRecord))
      return Promise.resolve()
    }
    return database
      .collection('dbAuditLogs')
      .add({
        executingUserId,
        scriptName,
        runDate,
        userId,
        changes: {
          [runDate.toISOString()]: {
            collectionName,
            previous: oldRecord,
            chagedTo: newRecord,
          },
        },
      })
      .then(() => {
        if (dryRun) {
          return Promise.resolve('No change.  Dry run mode.')
        }
        return database.collection(collectionName).doc(fileId).set(newRecord)
      })
  }

module.exports = {
  logChange,
}
