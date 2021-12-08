export const resumeDirective = (offlineFile, cloudFile) => {
  const originalVersionStamp = offlineFile.file.originalVersionStamp
  const currentVersionStamp = offlineFile.file.versionStamp
  const versionStampsExist = currentVersionStamp && originalVersionStamp
  const madeOfflineEdits = versionStampsExist && currentVersionStamp !== originalVersionStamp
  const madeEditsOnline = versionStampsExist && cloudFile.file.versionStamp !== originalVersionStamp
  const doNothing = !madeOfflineEdits
  const uploadOurs = madeOfflineEdits && !madeEditsOnline
  const backupOurs = !versionStampsExist || (madeOfflineEdits && madeEditsOnline)

  return [uploadOurs, backupOurs, doNothing]
}
