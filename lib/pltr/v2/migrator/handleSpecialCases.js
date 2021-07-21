import { clone, sortBy } from 'lodash'
import { nextColor, nextDarkColor } from '../store/lineColors'

// The 2021-07-07 version was problematic because it was created by
// broken templates.  In that version of the templates we had no
// 'light' and 'dark' keys on hierarchy configuration levels.
export const handle2021_07_07 = (file) => {
  if (file.file.version !== '2021.7.7') return file

  const newFile = clone(file)

  sortBy(Object.entries(newFile.hierarchyLevels), '0').forEach(([index, levelConfig]) => {
    newFile.hierarchyLevels[index].dark = {
      borderColor: nextDarkColor(0),
      textColor: nextDarkColor(0),
    }
    newFile.hierarchyLevels[index].light = {
      borderColor: nextColor(0),
      textColor: nextColor(0),
    }
  })

  if (!newFile.file.appliedMigrations) {
    newFile.file.appliedMigrations = []
  }
  newFile.file.appliedMigrations.push('m2021_7_7')

  return newFile
}

const applyAllFixes = (file) => [handle2021_07_07].reduce((acc, f) => f(acc), file)

export default applyAllFixes
