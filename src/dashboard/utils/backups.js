import fs from 'fs'
import path from 'path'
import { useState, useEffect } from 'react'
import { BACKUP_BASE_PATH } from '../../common/utils/config_paths'
import { sortBy } from 'lodash'

export function useBackupFolders () {
  const [folders, setFolders] = useState([])
  useEffect(() => {
    readBackupsDirectory(setFolders)
  }, [])

  return folders
}

function readBackupsDirectory (setFolders) {
  fs.readdir(BACKUP_BASE_PATH, (err, directories) => {
    const filteredDirs = directories.filter(d => d[0] != '.')
    let tempList = []
    filteredDirs.forEach(dir => {
      const thisPath = path.join(BACKUP_BASE_PATH, dir)
      fs.readdir(thisPath, (error, backupFiles) => {
        tempList.push({
          path: thisPath,
          date: dir,
          backups: backupFiles
        })
        setFolders(sortBy(tempList, a => new Date(a.date.replace(/_/g, '-'))).reverse())
      })
    })
  })
}