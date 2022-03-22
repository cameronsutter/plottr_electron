import { createSelector } from 'reselect'
import { sortBy } from 'lodash'
import { isLoggedInSelector } from './client'
import { shouldBeInProSelector } from './shouldBeInPro'

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

function getDateValue(fileObj) {
  if (fileObj.lastOpened) {
    return convertFromNanosAndSeconds(fileObj.lastOpened) || new Date()
  }

  try {
    const splits = fileObj.version.replace(/-.*$/, '').split('.')
    return new Date(splits[0], parseInt(splits[1]) - 1, splits[2])
  } catch (error) {
    // do nothing
  }

  return new Date()
}

export const knownFilesSelector = (state) => state.knownFiles
const selectId = (state, id) => id
export const fileFromFileIdSelector = createSelector(
  knownFilesSelector,
  selectId,
  (fileList, fileId) => {
    return fileList.find(({ id }) => id === fileId)
  }
)
export const fileSystemKnownFilesSelector = createSelector(knownFilesSelector, (files) => {
  return files.filter(({ fromFileSystem }) => fromFileSystem)
})
export const cloudFileListSelector = createSelector(knownFilesSelector, (files) => {
  return files.filter(({ isCloudFile }) => isCloudFile)
})
const searchTermSelector = (state, searchTerm) => searchTerm
export const sortedFileSystemKnownFilesByIdSelector = createSelector(
  fileSystemKnownFilesSelector,
  searchTermSelector,
  (files, searchTerm) => {
    const filteredFileIds = Object.keys(files).filter((id) => {
      if (searchTerm && searchTerm.length > 1) {
        const f = files[`${id}`]
        return (f.fileName || f.path).toLowerCase().includes(searchTerm.toLowerCase())
      } else {
        return true
      }
    })
    const sortedIds = sortBy(filteredFileIds, (id) => getDateValue(files[`${id}`])).reverse()
    return [sortedIds, files]
  }
)
const filesByPosition = (filesArray) => {
  const byPosition = {}
  filesArray.forEach((file, index) => {
    byPosition[index + 1] = file
  })
  return byPosition
}
const filesById = (filesArray) => {
  const byId = {}
  filesArray.forEach((file, index) => {
    byId[file.id] = file
  })
  return byId
}
export const sortedKnownFilesSelector = createSelector(
  fileSystemKnownFilesSelector,
  cloudFileListSelector,
  shouldBeInProSelector,
  isLoggedInSelector,
  searchTermSelector,
  (fileSystemFiles, cloudFiles, shouldBeInPro, isLoggedIn, searchTerm) => {
    if (shouldBeInPro && !isLoggedIn) {
      return [[], {}]
    }
    const files = shouldBeInPro ? filesByPosition(cloudFiles) : filesById(fileSystemFiles)
    const filteredFileIds = Object.keys(files).filter((id) => {
      if (searchTerm && searchTerm.length > 1) {
        const f = files[`${id}`]
        return (f.fileName || f.path).toLowerCase().includes(searchTerm.toLowerCase())
      } else {
        return true
      }
    })
    const sortedIds = sortBy(filteredFileIds, (id) => getDateValue(files[`${id}`])).reverse()

    return [sortedIds, files]
  }
)
