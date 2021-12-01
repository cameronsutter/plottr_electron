export const resumeDirective = (offlineFile, cloudFile) => {
  const originalTimeStamp = new Date(offlineFile.file.originalTimeStamp)
  const currentTimeStamp = new Date(offlineFile.file.timeStamp)
  const madeOfflineEdits = currentTimeStamp > originalTimeStamp
  const madeEditsOnline = cloudFile.file.timeStamp.toDate() > originalTimeStamp
  const doNothing = !madeOfflineEdits
  const uploadOurs = madeOfflineEdits && !madeEditsOnline
  const backupOurs = madeOfflineEdits && madeEditsOnline

  return [uploadOurs, backupOurs, doNothing]
}
