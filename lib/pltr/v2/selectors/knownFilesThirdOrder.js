import { sortBy } from 'lodash'
import { createSelector } from 'reselect'

import { getDateValue } from '../helpers/file'

// Other selector dependencies
import { isLoggedInSelector } from './clientFirstOrder'
import { cloudFileListSelector, fileSystemKnownFilesSelector } from './knownFilesFirstOrder'
import { shouldBeInProSelector } from './secondOrder'

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

const searchTermSelector = (state, searchTerm) => searchTerm
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
