import { createSelector } from 'reselect'
import { sortBy } from 'lodash'
import { isLoggedInSelector } from './client'
import { shouldBeInProSelector } from './shouldBeInPro'
import { getDateValue, isDeviceFileURL } from '../helpers/file'

export const knownFilesSelector = (state) => state.knownFiles
const selectId = (state, id) => id
export const fileFromFileIdSelector = createSelector(
  knownFilesSelector,
  selectId,
  (fileList, fileId) => {
    return fileList.find(({ id }) => id === fileId)
  }
)
const selectURL = (state, url) => url
export const fileFromFileURLSelector = createSelector(
  knownFilesSelector,
  selectURL,
  (fileList, searchFileURL) => {
    return fileList.find(({ fileURL }) => fileURL === searchFileURL)
  }
)
export const fileSystemKnownFilesSelector = createSelector(knownFilesSelector, (files) => {
  return files.filter(({ fileURL }) => {
    return isDeviceFileURL(fileURL)
  })
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

export const flatSortedKnownFilesSelector = createSelector(
  fileSystemKnownFilesSelector,
  cloudFileListSelector,
  shouldBeInProSelector,
  isLoggedInSelector,
  searchTermSelector,
  (fileSystemFiles, cloudFiles, shouldBeInPro, isLoggedIn, searchTerm) => {
    if (shouldBeInPro && !isLoggedIn) {
      return []
    }
    const files = shouldBeInPro ? cloudFiles : fileSystemFiles
    const filteredFiles = files.filter((file) => {
      if (searchTerm && searchTerm.length > 1) {
        return file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      } else {
        return true
      }
    })
    const sorted = sortBy(filteredFiles, (file) => getDateValue(file)).reverse()

    return sorted
  }
)

const fileURLSelector = (state, fileURL) => {
  return fileURL
}

export const isTempFileSelector = createSelector(
  fileSystemKnownFilesSelector,
  fileURLSelector,
  (files, fileURL) => {
    const file = files.find((file) => {
      return file.fileURL === fileURL
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
