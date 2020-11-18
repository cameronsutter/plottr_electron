import { useKnownFilesInfo, knownFilesStore } from '../../common/utils/store_hooks'
import { sortBy } from 'lodash'
import { useMemo } from 'react'

export function useSortedKnownFiles () {
  const [files] = useKnownFilesInfo()
  const sortedIds = useMemo(() => {
    return sortBy(Object.keys(files), (id) => {
      const f = files[`${id}`]
      return f.lastOpened
    }).reverse()
  }, [files])

  return [sortedIds, files]
}

function migrateKnownFileStore () {
  // MIGRATE ONE TIME (needed after 2020.11.11 for the dashboard)
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