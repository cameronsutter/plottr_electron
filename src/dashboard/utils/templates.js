import React, { useMemo } from 'react'
import { sortBy } from 'lodash'

export function useFilteredSortedTemplates(templatesById, type) {
  const filteredTemplates = useMemo(() => {
    return sortBy(Object.values(templatesById).filter(t => t.type == type), 'name')
  }, [templatesById])

  return filteredTemplates
}