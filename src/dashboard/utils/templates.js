import React, { useMemo } from 'react'
import { sortBy } from 'lodash'

export function useFilteredSortedTemplates(templatesById, type, searchTerm) {
  const filteredTemplates = useMemo(() => {
    return sortBy(Object.values(templatesById).filter(t => {
      if (searchTerm && searchTerm.length > 1) {
        return t.name.toLowerCase().includes(searchTerm) && t.type == type
      } else {
        return t.type == type
      }
    }), 'name')
  }, [templatesById, searchTerm])

  return filteredTemplates
}