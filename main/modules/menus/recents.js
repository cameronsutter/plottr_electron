import path from 'path'
import log from 'electron-log'

import { sortBy } from 'lodash'
import { getKnownFilesInfo } from '../known_files'
import { openProjectWindow } from '../windows/projects'

export function buildRecents() {
  return getKnownFilesInfo()
    .then((knownFiles) => {
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
            log.info('Opening recent file from menu', f.path)
            openProjectWindow(f.path)
              .then(() => {
                log.info('Opened recent file from menu', f.path)
              })
              .catch((error) => {
                log.error('Error opening  recent file from menu', f.path, error)
              })
          },
        }
      })
    })
    .catch((error) => {
      log.error('Failed to fetch recent files to build menu item', error)
      return []
    })
}
