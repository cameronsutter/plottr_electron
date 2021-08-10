import { clone, sortBy } from 'lodash'
import semverGt from 'semver/functions/gt'

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
      textColor: nextColor('default'),
    }
  })

  if (!newFile.file.appliedMigrations) {
    newFile.file.appliedMigrations = []
  }
  newFile.file.appliedMigrations.push('m2021_7_7')

  return newFile
}

// Some users have cards with no `templates` field.  In 2020.3.4 we
// add the `templates` field to all cards and give it a default of
// `[]`.  If any cards lack this field and are later than 2020.3.4,
// then we go ahead and add the field in.
export const handleMissingTemplatesFieldOnCards = (file) => {
  if (semverGt('2020.3.4', file.file.version)) {
    return file
  }

  // Check, and leave the file completely un changed if there were no
  // problems, because that feels safer.
  const thereAreMissingTemplates = file.cards.some(
    (card) => !card.templates || !Array.isArray(card.templates)
  )

  if (!thereAreMissingTemplates) return file

  const appliedMigrations = file.file.appliedMigrations || []

  return {
    ...clone(file),
    file: {
      ...clone(file.file),
      appliedMigrations: [...appliedMigrations, 'm2020_3_5'],
    },
    cards: file.cards.map((card) => ({
      ...card,
      templates: card.templates || [],
    })),
  }
}

const applyAllFixes = (file) =>
  [handle2021_07_07, handleMissingTemplatesFieldOnCards].reduce((acc, f) => f(acc), file)

export default applyAllFixes
