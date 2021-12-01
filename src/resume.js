export const resumeDirective = (offlineFile, cloudFile) => {
  const originalTimeStamp =
    offlineFile.file.originalTimeStamp && new Date(offlineFile.file.originalTimeStamp)
  const currentTimeStamp = offlineFile.file.timeStamp && new Date(offlineFile.file.timeStamp)
  const timestampsExist = currentTimeStamp && originalTimeStamp
  const madeOfflineEdits =
    timestampsExist && currentTimeStamp.getTime() !== originalTimeStamp.getTime()
  const madeEditsOnline =
    timestampsExist && cloudFile.file.timeStamp.toDate().getTime() !== originalTimeStamp.getTime()
  const doNothing = !madeOfflineEdits
  const uploadOurs = madeOfflineEdits && !madeEditsOnline
  const backupOurs = !timestampsExist || (madeOfflineEdits && madeEditsOnline)

  return [uploadOurs, backupOurs, doNothing]
}
