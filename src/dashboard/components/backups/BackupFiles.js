import React from 'react'
import path from 'path'
import { t } from 'plottr_locales'
import { IoIosDocument } from 'react-icons/io'
import { shell } from 'electron'
import MPQ from '../../../common/utils/MPQ'
import PropTypes from 'react-proptypes'

export default function BackupFiles({ folder, searchTerm }) {
  const openInFolder = (filePath) => {
    MPQ.push('btn_open_backup')
    shell.showItemInFolder(filePath)
  }

  const fileName = (name) => {
    if (name.includes('(start-session)-')) {
      const nameSansStart = name.replace('(start-session)-', '')
      return (
        <p>
          <strong>{t('Session Start')}</strong>
          <br />
          <span>{nameSansStart}</span>
        </p>
      )
    } else {
      return <p>{name}</p>
    }
  }

  const renderedFiles = folder.backups.reduce((acc, b) => {
    if (b.toLowerCase().includes(searchTerm)) {
      const filePath = path.join(folder.path, b)
      acc.push(
        <div
          key={b}
          className="dashboard__backups__item icon file"
          onClick={() => openInFolder(filePath)}
        >
          <IoIosDocument />
          <div>{fileName(b)}</div>
        </div>
      )
    }
    return acc
  }, [])

  if (renderedFiles.length) {
    return renderedFiles
  }
  return <p>{t('No Matches')}</p>
}

BackupFiles.propTypes = {
  folder: PropTypes.shape({ backups: PropTypes.array, path: PropTypes.string }),
  searchTerm: PropTypes.string,
}
