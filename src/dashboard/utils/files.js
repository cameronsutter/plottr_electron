import { useKnownFilesInfo } from '../../common/utils/store_hooks'
import { sortBy } from 'lodash'
import { useMemo } from 'react'

export function useSortedKnownFiles () {
  const [files] = useKnownFilesInfo()
  const sortedIds = useMemo(() => {
    return sortBy(Object.keys(files), (id) => {
      const f = files[`${id}`]
      return f.lastOpened
    })
  }, [files])

  return [sortedIds, files]
}