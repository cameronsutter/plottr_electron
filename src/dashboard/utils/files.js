import { ipcRenderer } from 'electron'
import fs from 'fs'
import { useMemo } from 'react'
import { sortBy } from 'lodash'
import { useKnownFilesInfo, knownFilesStore } from '../../common/utils/store_hooks'

export function useSortedKnownFiles(searchTerm, initialFilesFromFirebase, checkOften = true) {
  const [files] = useKnownFilesInfo(initialFilesFromFirebase, checkOften)
  const sortedIds = useMemo(() => {
    const filteredFileIds = Object.keys(files).filter((id) => {
      if (searchTerm && searchTerm.length > 1) {
        const f = files[`${id}`]
        return f.path.toLowerCase().includes(searchTerm)
      } else {
        return true
      }
    })
    return sortBy(filteredFileIds, (id) => files[`${id}`].lastOpened).reverse()
  }, [files, searchTerm, initialFilesFromFirebase])

  return [sortedIds, files]
}

export function doesFileExist(filePath) {
  return fs.existsSync(filePath)
}

function migrateKnownFileStore() {
  // MIGRATE ONE TIME (needed after 2020.12.1 for the dashboard)
  const needsMigration = knownFilesStore.has('byIds') || knownFilesStore.has('allIds')
  if (needsMigration) {
    // it's in the old format and we need to migrate
    // const filesById = knownFilesStore.get('byIds')
    const fileIds = knownFilesStore.get('allIds')
    const fileObjects = fileIds.reduce((acc, id, idx) => {
      const key = `byIds.${id.replace('.', '~$~')}`
      const val = knownFilesStore.get(key)
      if (val) {
        // create an entry for this file
        const newId = idx + 1
        const entry = {
          path: id,
          lastOpened: val.lastOpened,
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

export function removeFromKnownFiles(id) {
  ipcRenderer.send('remove-from-known-files', id)
}
