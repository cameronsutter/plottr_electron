import { createSelector } from 'reselect'
import { sortBy } from 'lodash'

import { t } from 'plottr_locales'

export const backupFoldersSelector = (state) => state.backups.folders

const visualDateStringFromDateString = (dateString) => {
  return t('{date, date, medium}', {
    date: new Date(dateString.replace(/_/g, '-')),
  })
}
const searchTermSelector = (state, searchTerm) => searchTerm
const folderSearchSelector = (state, _searchTerm, folderSearch) => folderSearch
const sortFolders = (folders) => {
  return sortBy(folders, (folder) => {
    return new Date(folder.date.replace(/_/g, '-'))
  }).reverse()
}
const matchesSearchTerm = (searchTerm) => (file) => {
  return file.fileName && file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
}
export const filteredSortedBackupsSelector = createSelector(
  backupFoldersSelector,
  searchTermSelector,
  folderSearchSelector,
  (backupFolders, searchTerm, folderSearch) => {
    if (searchTerm && searchTerm.length > 1) {
      const matchingFolders = backupFolders.reduce((acc, obj) => {
        const matches = folderSearch
          ? obj.backups
          : obj.backups.filter(matchesSearchTerm(searchTerm))
        const folderDate = visualDateStringFromDateString(obj.path.toString()).toLowerCase()
        if (folderDate.includes(searchTerm.toLowerCase()) || (matches.length && !folderSearch)) {
          acc.push({ ...obj, backups: matches })
        }
        return acc
      }, [])
      return sortFolders(matchingFolders)
    }

    return sortFolders(backupFolders)
  }
)
