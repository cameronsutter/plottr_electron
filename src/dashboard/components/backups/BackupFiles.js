import React from 'react'
import path from 'path'
import { t } from 'plottr_locales'
import { IoIosDocument } from 'react-icons/io'
import { shell } from 'electron'
import MPQ from '../../../common/utils/MPQ'

export default function BackupFiles({ folder }) {
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
      return name
    }
  }

  const renderedFiles = folder.backups.map((b) => {
    const filePath = path.join(folder.path, b)
    return (
      <div key={b} className="dashboard__backups__item icon" onClick={() => openInFolder(filePath)}>
        <IoIosDocument />
        <div>{fileName(b)}</div>
      </div>
    )
  })

  return renderedFiles
}
