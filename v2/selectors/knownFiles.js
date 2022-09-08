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

const VERY_OLD_DATE = new Date(0)

function getDateValue(fileObj) {
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
    const filteredFileIds = files
      .filter((f) => {
        if (searchTerm && searchTerm.length > 1) {
          return (f.fileName || f.path).toLowerCase().includes(searchTerm.toLowerCase())
        } else {
          return true
        }
      })
      .map(({ id }) => {
        return id
      })
    const sortedIds = sortBy(filteredFileIds, (id) =>
      getDateValue(files.find((file) => file.id === id))
    ).reverse()
    const filesById = files.reduce((acc, nextFile) => {
      return {
        ...acc,
        [nextFile.id]: nextFile,
      }
    }, {})
    return [sortedIds, filesById]
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

export const filepathSelector = (state, path) => {
  return path
}

export const isTempFileSelector = createSelector(
  fileSystemKnownFilesSelector,
  filepathSelector,
  (files, path) => {
    const file = files.find((file) => {
      return file.path === path
    })
    return file && file.isTempFile
  }
)

export const sortedProKnownFilesByIdSelector = createSelector(
  cloudFileListSelector,
  searchTermSelector,
  (files, searchTerm) => {
    const filteredFileIds = files
      .filter((f) => {
        if (searchTerm && searchTerm.length > 1) {
          return (f.fileName || f.path).toLowerCase().includes(searchTerm.toLowerCase())
        } else {
          return true
        }
      })
      .map(({ id }) => {
        return id
      })
    const sortedIds = sortBy(filteredFileIds, (id) =>
      getDateValue(files.find((file) => file.id === id))
    ).reverse()
    const filesById = files.reduce((acc, nextFile) => {
      return {
        ...acc,
        [nextFile.id]: nextFile,
      }
    }, {})
    return [sortedIds, filesById]
  }
)

export const sortedFlatProKnownFilesByIdSelector = createSelector(
  sortedProKnownFilesByIdSelector,
  (proFiles) => {
    return proFiles[0].map((id) => proFiles[1][id])
  }
)
