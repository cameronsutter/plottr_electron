import React, { useState, useEffect } from 'react'
import { t } from 'plottr_locales'
import cx from 'classnames'
import { StickyTable, Row, Cell } from 'react-sticky-table'
import MissingIndicator from './MissingIndicator'
import UnconnectedFileActions from './FileActions'
import RecentsHeader from './RecentsHeader'

const RecentFilesConnector = (connector) => {
  const {
    platform: {
      file: { isTempFile, doesFileExist, useSortedKnownFiles, pathSep, basename, openKnownFile },
    },
  } = connector

  const FileActions = UnconnectedFileActions(connector)

  const RecentFiles = (props) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortedIds, filesById] = useSortedKnownFiles(searchTerm)
    const [missingFiles, setMissing] = useState([])
    const [selectedFile, selectFile] = useState(null)

    useEffect(() => {
      let newMissing = [...missingFiles]
      sortedIds.forEach((id) => {
        if (!doesFileExist(filesById[`${id}`].path)) {
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
        if (!f || !f.path) return null

        const lastOpen = new Date(f.lastOpened)
        const fileBasename = basename(f.path)
        let formattedPath = ''
        if (!isTempFile(f.path)) {
          formattedPath = f.path
            .replace(fileBasename, '')
            .split(pathSep)
            .filter(Boolean)
            .join(' » ')
        }
        let missing = null
        if (missingFiles.includes(id)) {
          missing = <MissingIndicator />
        }
        const selected = selectedFile == id
        return (
          <Row
            key={idx}
            onDoubleClick={() => openFile(f.path, id)}
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
                <FileActions missing={!!missing} id={id} filePath={f.path} openFile={openFile} />
              </div>
            </Cell>
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
