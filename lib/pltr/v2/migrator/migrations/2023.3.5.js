import { isEmpty } from 'lodash'

import { hierarchyLevel } from '../../store/initialState'

function migrate(data) {
  if (data.file && data.file.version === '2023.3.5') return data

  if (!data.hierarchyLevels || isEmpty(data.hierarchyLevels)) {
    const bookIds = data.books ? Object.keys(data.books) : [1]
    return {
      ...data,
      hierarchyLevels: [...bookIds, 'series'].reduce((acc, key) => {
        if (key !== 'allIds') {
          return {
            ...acc,
            [key]: { 0: hierarchyLevel },
          }
        }

        return acc
      }, {}),
    }
  } else if (
    !isEmpty(data.hierarchyLevels) &&
    typeof Object.values(data.hierarchyLevels)[0].name !== 'undefined'
  ) {
    const bookIds = data.books ? Object.keys(data.books) : [1]
    return {
      ...data,
      hierarchyLevels: [...bookIds, 'series'].reduce((acc, key) => {
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
