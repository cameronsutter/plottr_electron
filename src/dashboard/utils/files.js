import { useMemo } from 'react'
import { sortBy } from 'lodash'
import { useKnownFilesInfo, knownFilesStore } from '../../common/utils/store_hooks'

export function useSortedKnownFiles (searchTerm) {
  const [files] = useKnownFilesInfo()
  const sortedIds = useMemo(() => {
    const filteredFileIds = Object.keys(files).filter(id => {
      if (searchTerm && searchTerm.length > 1) {
        const f = files[`${id}`]
        return f.path.toLowerCase().includes(searchTerm)
      } else {
        return true
      }
    })
    return sortBy(filteredFileIds, (id) => {
      const f = files[`${id}`]
      return f.lastOpened
    }).reverse()
  }, [files, searchTerm])

  return [sortedIds, files]
}

function migrateKnownFileStore () {
  // MIGRATE ONE TIME (needed after 2020.12.1 for the dashboard)
  const filesById = knownFilesStore.get('byIds')
  if (filesById && Object.keys(filesById).length) {
    // it's in the old format and we need to migrate
    const fileIds = knownFilesStore.get('allIds')
    const fileObjects = fileIds.reduce((acc, id, idx) => {
      const key = `byIds.${id.replace('.', '~$~')}`
      const val = knownFilesStore.get(key)
      if (val) {
        // create an entry for this file
        const newId = idx + 1
        const entry = {
          path: id,
          lastOpened: val.lastOpened
        }
        acc[newId] = entry
      }
      return acc
    }, {})
    knownFilesStore.clear()
    knownFilesStore.set(fileObjects)
  }
}

migrateKnownFileStore()