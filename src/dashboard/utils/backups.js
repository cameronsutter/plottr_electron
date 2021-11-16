import fs from 'fs'
import path from 'path'
import { groupBy, flatten, sortBy } from 'lodash'
import { useState, useEffect } from 'react'

import { t } from 'plottr_locales'

import { backupBasePath } from '../../common/utils/backup'
import { listenForBackups } from 'wired-up-firebase'

const visualDateStringFromDateString = (dateString) => {
  return t('{date, date, medium}', {
    date: new Date(dateString.replace(/_/g, '-')),
  })
}

export function useBackupFolders(userId, searchTerm) {
  const [localFolders, setLocalFolders] = useState([])
  const [localFoldersOnDisk, setLocalFoldersOnDisk] = useState([])

  useEffect(() => {
    readBackupsDirectory(setLocalFoldersOnDisk)
  }, [])
  useEffect(() => {
    if (searchTerm && searchTerm.length > 1) {
      const matchingFolders = localFoldersOnDisk.reduce((acc, obj) => {
        const matches = obj.backups.filter((f) =>
          f.toLowerCase().includes(searchTerm.toLowerCase())
        )
        const folderDate = new Date(visualDateStringFromDateString(obj.date))
          .toString()
          .toLowerCase()
        if (folderDate.includes(searchTerm.toLowerCase()) || matches.length) {
          acc.push({ ...obj, backups: matches })
        }
        return acc
      }, [])
      setLocalFolders(matchingFolders)
    } else {
      setLocalFolders(localFoldersOnDisk)
    }
  }, [localFoldersOnDisk, searchTerm])

  const [firebaseFolders, setFirebaseFolders] = useState([])
  const [firebaseFoldersOnDisk, setFirebaseFoldersOnDisk] = useState([])

  useEffect(() => {
    if (!userId) return () => {}

    return listenForBackups(userId, (backups) => {
      const grouped = groupBy(backups, (backup) => {
        const date = backup?.lastModified?.toDate() || new Date()
        return `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}`
      })
      const backupFolders = []
      Object.keys(grouped).forEach((key) => {
        backupFolders.push({
          backups: grouped[key],
          path: key,
          date: grouped[key][0]?.lastModified?.toDate() || new Date(),
        })
      })
      setFirebaseFoldersOnDisk(backupFolders)
    })
  }, [userId])

  useEffect(() => {
    if (searchTerm && searchTerm.length > 1) {
      const matchingFolders = firebaseFoldersOnDisk.reduce((acc, obj) => {
        const matches = obj.backups.filter((f) => f.fileName?.toLowerCase()?.includes(searchTerm))
        const folderDate = visualDateStringFromDateString(obj.path.toString()).toLowerCase()
        if (folderDate.includes(searchTerm.toLowerCase()) || matches.length) {
          acc.push({ ...obj, backups: matches })
        }
        return acc
      }, [])
      setFirebaseFolders(matchingFolders)
    } else {
      setFirebaseFolders(firebaseFoldersOnDisk)
    }
  }, [firebaseFoldersOnDisk, searchTerm])

  const [folders, setFolders] = useState([])

  useEffect(() => {
    const allFolders = firebaseFolders
      .map((folder) => ({ ...folder, date: folder.path }))
      .concat(localFolders)
    const grouped = groupBy(allFolders, 'date')
    const results = []
    Object.entries(grouped).forEach(([key, group]) => {
      results.push({
        date: key,
        path: group[0].path,
        backups: flatten(group.map(({ backups }) => backups)),
      })
    })
    setFolders(
      sortBy(results, (folder) => {
        return new Date(folder.date.replace(/_/g, '-'))
      })
    )
  }, [firebaseFolders, localFolders])

  return folders
}

function readBackupsDirectory(setLocalFolders) {
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
        setLocalFolders(sortBy(tempList, (a) => new Date(a.date.replace(/_/g, '-'))).reverse())
      })
    })
  })
}
