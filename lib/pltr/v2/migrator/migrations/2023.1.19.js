import { isEmpty } from 'lodash'

import { newFileHierarchies } from '../../store/newFileState'

function migrate(data) {
  if (data.file && data.file.version === '2023.1.19') return data

  if (!data.hierarchyLevels || isEmpty(data.hierarchyLevels)) {
    return {
      ...data,
      hierarchyLevels: [...Object.keys(data.books), 'series'].reduce((acc, key) => {
        if (key !== 'allIds') {
          return {
            ...acc,
            [key]: newFileHierarchies,
          }
        }

        return acc
      }, {}),
    }
  } else if (
    !isEmpty(data.hierarchyLevels) &&
    typeof Object.values(data.hierarchyLevels)[0].name !== 'undefined'
  ) {
    return {
      ...data,
      hierarchyLevels: [...Object.keys(data.books), 'series'].reduce((acc, key) => {
        if (key !== 'allIds') {
          return {
            ...acc,
            [key]: data.hierarchyLevels,
          }
        }

        return acc
      }, {}),
    }
  } else {
    return data
  }
}

export default migrate
