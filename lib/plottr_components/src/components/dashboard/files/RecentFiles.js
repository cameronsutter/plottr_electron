import React, { useState, useEffect } from 'react'
import { AiOutlineTeam, AiOutlineRead } from 'react-icons/ai'
import { GiQuillInk } from 'react-icons/gi'

import { t } from 'plottr_locales'
import cx from 'classnames'
import { StickyTable, Row, Cell } from 'react-sticky-table'
import MissingIndicator from './MissingIndicator'
import UnconnectedFileActions from './FileActions'
import RecentsHeader from './RecentsHeader'
import { checkDependencies } from '../../checkDependencies'

const renderPermission = (permission) => {
  switch (permission) {
    case 'collaborator':
      return (
        <div>
          <AiOutlineTeam />
          Collaborator
        </div>
      )
    case 'viewer':
      return (
        <div>
          <AiOutlineRead />
          Viewer
        </div>
      )
    case 'owner':
      return (
        <div>
          <GiQuillInk />
          Owner
        </div>
      )
    default:
      return null
  }
}

const RecentFilesConnector = (connector) => {
  const {
    platform: {
      file: { isTempFile, doesFileExist, useSortedKnownFiles, pathSep, basename, openKnownFile },
      log,
    },
  } = connector
  checkDependencies({
    isTempFile,
    doesFileExist,
    useSortedKnownFiles,
    pathSep,
    basename,
    openKnownFile,
    log,
  })

  const FileActions = UnconnectedFileActions(connector)

  const RecentFiles = (props) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortedIds, filesById] = useSortedKnownFiles(searchTerm)
    const [missingFiles, setMissing] = useState([])
    const [selectedFile, selectFile] = useState(null)

    useEffect(() => {
      let newMissing = [...missingFiles]
      sortedIds.forEach((id) => {
        const filePath = filesById[`${id}`].path
        if (!filePath) {
          log.warn(`File with id: ${id}, doesn't have a "filePath"`)
          return
        }
        if (!doesFileExist(filePath)) {
          newMissing.push(id)
        }
      })
      setMissing(newMissing)
    }, [sortedIds, filesById])

    const openFile = (filePath, id) => {
      if (missingFiles.includes(id)) return
      openKnownFile(filePath, id)
    }

    const renderRecents = () => {
      // TODO: if no files, show something different
      if (!sortedIds.length) return null

      const renderedFiles = sortedIds.map((id, idx) => {
        const f = filesById[`${id}`]
        if (!f) return null

        // TODO: where do web last save dates come from?  Backups perhaps?
        const lastOpen = (f.lastOpened && new Date(f.lastOpened)) || new Date()
        const fileBasename = (f.path && basename(f.path)) || f.fileName
        let formattedPath = ''
        if (f.path && !isTempFile(f.path)) {
          formattedPath = f.path
            .replace(fileBasename, '')
            .split(pathSep)
            .filter(Boolean)
            .join(' » ')
        } else {
          formattedPath = f.fileName
        }
        let missing = null
        if (missingFiles.includes(id)) {
          missing = <MissingIndicator />
        }
        const selected = selectedFile == id
        return (
          <Row
            key={idx}
            onDoubleClick={() => openFile(f.path || f.id, id)}
            onClick={() => selectFile(selected ? null : id)}
            className={cx({ selected: selected })}
          >
            <Cell>
              <div className="dashboard__recent-files__file-cell">
                <div>
                  <div className="title">
                    {missing}
                    {fileBasename.replace('.pltr', '')}
                  </div>
                  <div className="secondary-text">{formattedPath}</div>
                </div>
                <FileActions
                  missing={!!missing}
                  id={id}
                  filePath={f.path || f.id}
                  openFile={openFile}
                />
              </div>
            </Cell>
            {f.permission ? <Cell>{renderPermission(f.permission)}</Cell> : null}
            <Cell>
              <div className="lastOpen">{t('{date, date, monthDay}', { date: lastOpen })}</div>
            </Cell>
          </Row>
        )
      })

      return (
        <div className="dashboard__recent-files__table">
          <StickyTable leftStickyColumnCount={0}>
            <Row>
              <Cell>{t('Name')}</Cell>
              {Object.values(filesById).some(({ permission }) => permission) ? (
                <Cell>{t('Permission')}</Cell>
              ) : null}
              <Cell>{t('Last opened by you')}</Cell>
            </Row>
            {renderedFiles}
          </StickyTable>
        </div>
      )
    }

    return (
      <div className="dashboard__recent-files">
        <RecentsHeader setSearchTerm={setSearchTerm} />
        {renderRecents()}
      </div>
    )
  }

  return RecentFiles
}

export default RecentFilesConnector
