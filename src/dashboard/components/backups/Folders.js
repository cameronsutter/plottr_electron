import React from 'react'
import { t } from 'plottr_locales'
import { IoIosFolder } from 'react-icons/io'
import { useBackupFolders } from '../../utils/backups'
import { Spinner } from 'connected-components'
import { Badge } from 'react-bootstrap'

export default function Folders({ selectFolder }) {
  const folders = useBackupFolders()
  if (!folders.length) return <Spinner />

  const renderedFolders = folders.map((f) => {
    const dateStr = t('{date, date, medium}', { date: new Date(f.date.replace(/_/g, '-')) })
    return (
      <div key={f.date} className="dashboard__backups__item icon" onClick={() => selectFolder(f)}>
        <div>
          <IoIosFolder />
          <Badge>{f.backups.length}</Badge>
        </div>
        <div>{dateStr}</div>
      </div>
    )
  })

  return renderedFolders
}
