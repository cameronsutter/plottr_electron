import path from 'path'
import { sortBy } from 'lodash'
import { getKnownFilesInfo } from '../known_files'
import { openProjectWindow } from '../windows/projects'

export function buildRecents() {
  const knownFiles = getKnownFilesInfo()
  const sortedFiles = sortBy(
    Object.values(knownFiles).filter((f) => !!f.path),
    'lastOpened'
  ).reverse()
  return sortedFiles.map((f) => {
    const basename = path.basename(f.path)
    const sublabel = path.dirname(f.path).substr(-14)
    return {
      label: basename,
      sublabel: `...${sublabel}${path.sep}`,
      toolTip: f.path,
      click: () => {
        openProjectWindow(f.path)
      },
    }
  })
}

export function hasRecents() {
  const knownFiles = getKnownFilesInfo()
  return knownFiles && Object.keys(knownFiles).length > 0
}
