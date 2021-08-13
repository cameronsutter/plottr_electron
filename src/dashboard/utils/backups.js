import fs from 'fs'
import path from 'path'
import { useState, useEffect } from 'react'
import { backupBasePath } from '../../common/utils/backup'
import { sortBy } from 'lodash'

export function useBackupFolders(searchTerm) {
  const [folders, setFolders] = useState([])
  const [foldersOnDisk, setFoldersOnDisk] = useState([])
  // const foldersOnDisk = useMemo(() => readBackupsDirectory())
  useEffect(() => {
    readBackupsDirectory(setFoldersOnDisk)
  }, [])
  useEffect(() => {
    if (searchTerm && searchTerm.length > 1) {
      const matchingFolders = foldersOnDisk.reduce((acc, obj) => {
        const matches = obj.backups.filter((f) => f.toLowerCase().includes(searchTerm))
        const folderDate = new Date(obj.date.replace(/_/g, '-')).toString().toLowerCase()
        if (folderDate.includes(searchTerm) || matches.length) {
          acc.push({ ...obj, backups: matches })
        }
        return acc
      }, [])
      setFolders(matchingFolders)
    } else {
      setFolders(foldersOnDisk)
    }
  }, [foldersOnDisk, searchTerm])

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
