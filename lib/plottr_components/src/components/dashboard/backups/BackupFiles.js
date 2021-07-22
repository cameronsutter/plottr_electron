import React from 'react'
import { t } from 'plottr_locales'
import { IoIosDocument } from 'react-icons/io'

const BackupFilesConnector = (connector) => {
  const {
    platform: { mpq, showItemInFolder, joinPath },
  } = connector

  const BackupFiles = ({ folder }) => {
    const openInFolder = (filePath) => {
      mpq.push('btn_open_backup')
      showItemInFolder(filePath)
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
        return name
      }
    }

    const renderedFiles = folder.backups.map((b) => {
      const filePath = joinPath(folder.path, b)
      return (
        <div
          key={b}
          className="dashboard__backups__item icon"
          onClick={() => openInFolder(filePath)}
        >
          <IoIosDocument />
          <div>{fileName(b)}</div>
        </div>
      )
    })

    return renderedFiles
  }

  return BackupFiles
}

export default BackupFilesConnector
