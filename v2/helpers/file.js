export const urlPointsToPlottrCloud = (fileURL) => fileURL && fileURL.startsWith('plottr://')

export const fileIdToPlottrCloudFileURL = (fileId) => {
  if (!fileId) {
    return null
  }

  return `plottr://${fileId}`
}

export const isPlottrCloudFile = (file) => file && urlPointsToPlottrCloud(file.fileURL)

export const isDeviceFileURL = (url) => {
  return url && url.startsWith('device://')
}

export const fileIdFromPlottrProFile = (fileURL) => {
  if (fileURL && fileURL.startsWith('plottr://')) {
    return fileURL.substring(9)
  }
  return null
}

export const isProtocolString = (s) => {
  return s.match(/^[a-z]+:\/\//)
}

export const withoutProtocol = (fileURL) => {
  if (!fileURL) {
    return null
  }

  const protocolMatch = fileURL.match(/^[a-z]+:\/\//)
  if (protocolMatch) {
    return fileURL.substring(protocolMatch[0].length)
  }

  return fileURL
}

const convertFromNanosAndSeconds = (nanosAndSecondsObject) => {
  if (
    !nanosAndSecondsObject ||
    !nanosAndSecondsObject.nanoseconds ||
    !nanosAndSecondsObject.seconds
  ) {
    return null
  }
  return new Date(
    nanosAndSecondsObject.seconds * 1000 + nanosAndSecondsObject.nanoseconds / 1000000
  )
}

const VERY_OLD_DATE = new Date(0)

export function getDateValue(fileObj) {
  if (!fileObj.lastOpened) {
    return VERY_OLD_DATE
  }

  // At some point, we stored a timestamp in this field.  Now it's a
  // `seconds`, and `nanoseconds` object.
  const lastOpenedIsString = typeof fileObj.lastOpened === 'string'
  const lastOpenedIsObject = typeof fileObj.lastOpened === 'object'
  const lastOpenedIsNumber = typeof fileObj.lastOpened === 'number'

  if (!lastOpenedIsString && fileObj.lastOpened && lastOpenedIsObject) {
    return convertFromNanosAndSeconds(fileObj.lastOpened) || new Date()
  }

  if (lastOpenedIsNumber) {
    return new Date(fileObj.lastOpened)
  }

  if (lastOpenedIsString) {
    return new Date(fileObj.lastOpened)
  }

  try {
    const splits = fileObj.version.replace(/-.*$/, '').split('.')
    return new Date(splits[0], parseInt(splits[1]) - 1, splits[2])
  } catch (error) {
    // do nothing
  }

  return new Date()
}

export const filePathToFileURL = (filePath) => {
  if (!filePath) {
    return null
  }

  return `device://${filePath}`
}
