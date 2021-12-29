import { createSelector } from 'reselect'
import { sortBy } from 'lodash'
import { previouslyLoggedIntoProSelector } from './settings'
import { isLoggedInSelector } from './client'
import { fileListSelector } from './project'

function getDateValue(fileObj) {
  if (fileObj.lastOpened) {
    return fileObj.lastOpened.toDate ? fileObj.lastOpened.toDate() : new Date(fileObj.lastOpened)
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
export const fileSystemKnownFilesSelector = createSelector(knownFilesSelector, (files) => {
  return files.filter(({ fromFileSystem }) => fromFileSystem)
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
export const sortedKnownFilesSelector = createSelector(
  knownFilesSelector,
  fileListSelector,
  previouslyLoggedIntoProSelector,
  isLoggedInSelector,
  searchTermSelector,
  (fileSystemFiles, cloudFiles, previouslyLoggedIntoPro, isLoggedIn, searchTerm) => {
    if (previouslyLoggedIntoPro && !isLoggedIn) {
      return [[], {}]
    }
    const files = previouslyLoggedIntoPro ? filesByPosition(cloudFiles) : fileSystemFiles
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
