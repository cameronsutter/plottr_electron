import fs from 'fs'
import path from 'path'
import { useState, useEffect } from 'react'
import { backupBasePath } from '../../common/utils/backup'
import { sortBy } from 'lodash'

export function useBackupFolders() {
  const [folders, setFolders] = useState([])
  useEffect(() => {
    readBackupsDirectory(setFolders)
  }, [])

  return folders
}

function readBackupsDirectory(setFolders) {
  fs.readdir(backupBasePath(), (err, directories) => {
    const filteredDirs = directories.filter((d) => {
      return d[0] != '.' && !d.includes('.pltr')
    })
    let tempList = []
    filteredDirs.forEach((dir) => {
      const thisPath = path.join(backupBasePath(), dir)
      fs.readdir(thisPath, (error, backupFiles) => {
        tempList.push({
          path: thisPath,
          date: dir,
          backups: backupFiles,
        })
        setFolders(sortBy(tempList, (a) => new Date(a.date.replace(/_/g, '-'))).reverse())
      })
    })
  })
}
