import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { AiOutlineTeam, AiOutlineRead } from 'react-icons/ai'
import { GiQuillInk } from 'react-icons/gi'

import { t } from 'plottr_locales'
import cx from 'classnames'
import { StickyTable, Row, Cell } from 'react-sticky-table'
import MissingIndicator from './MissingIndicator'
import UnconnectedFileActions from './FileActions'
import RecentsHeader from './RecentsHeader'
import { checkDependencies } from '../../checkDependencies'
import { Spinner } from '../../Spinner'
import { isEqual } from 'lodash'

const isPlottrCloudFile = (filePath) => (filePath && filePath.startsWith('plottr://')) || !filePath

const renderPermission = (permission) => {
  switch (permission) {
    case 'collaborator':
      return (
        <div className="permissions">
          <AiOutlineTeam />
          {t('Collaborator')}
        </div>
      )
    case 'viewer':
      return (
        <div className="permissions">
          <AiOutlineRead />
          {t('Viewer')}
        </div>
      )
    case 'owner':
      return (
        <div className="permissions">
          <GiQuillInk />
          {t('Owner')}
        </div>
      )
    default:
      return null
  }
}

const sortAndSearch = () => {
  return [[], []]
}

const RecentFilesConnector = (connector) => {
  const {
    platform: {
      file: {
        isTempFile,
        doesFileExist,
        useSortedKnownFiles,
        pathSep,
        basename,
        openKnownFile,
        listOfflineFiles,
      },
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
    listOfflineFiles,
  })

  const FileActions = UnconnectedFileActions(connector)

  const RecentFiles = ({ fileList, isOffline }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [onlineSortedIds, onlineFilesById] = useSortedKnownFiles(searchTerm, fileList)
    const [sortedIds, setSortedIds] = useState(onlineSortedIds)
    const [filesById, setFilesById] = useState(onlineFilesById)
    const [missingFiles, setMissing] = useState([])
    const [selectedFile, selectFile] = useState(null)

    useEffect(() => {
      let newMissing = [...missingFiles]
      sortedIds.forEach((id) => {
        const filePath = filesById[`${id}`].path
        if (!filePath) {
          return
        }
        if (isPlottrCloudFile(filePath)) {
          return
        }
        if (!doesFileExist(filePath)) {
          newMissing.push(id)
        }
      })
      setMissing(newMissing)
    }, [sortedIds, filesById])

    useEffect(() => {
      if (!isOffline) {
        if (!isEqual(onlineSortedIds, sortedIds)) {
          setSortedIds(onlineSortedIds)
        }
        if (!isEqual(onlineFilesById, filesById)) {
          setFilesById(onlineFilesById)
        }
      } else {
        const [offlineSortedIds, offlineFilesById] = sortAndSearch(listOfflineFiles())
        if (!isEqual(offlineSortedIds, sortedIds)) {
          setSortedIds(offlineSortedIds)
        }
        if (!isEqual(offlineFilesById, filesById)) {
          setFilesById(offlineFilesById)
        }
      }
    }, [isOffline, onlineSortedIds, onlineFilesById, setFilesById, setSortedIds])

    const openFile = (filePath, id) => {
      return openKnownFile(filePath, id)
    }

    const renderRecents = () => {
      // TODO: if no files, show something different
      if (!sortedIds.length) return <span>{t('No files found.')}</span>

      const fileWithPermissionsExists = Object.values(filesById).some(
        ({ permission }) => permission
      )

      // cloud files' lastOpened date comes from version ... do we need something better?
      const makeLastOpen = (fileObj) => {
        if (fileObj.lastOpened) {
          return fileObj.lastOpened.toDate
            ? fileObj.lastOpened.toDate()
            : new Date(fileObj.lastOpened)
        }

        try {
          const splits = fileObj.version.replace(/-.*$/, '').split('.')
          return new Date(splits[0], parseInt(splits[1]) - 1, splits[2])
        } catch (error) {
          // do nothing
        }

        return new Date()
      }

      const renderedFiles = sortedIds.map((id, idx) => {
        const f = filesById[`${id}`]
        if (!f) return null

        const onFirebase = isPlottrCloudFile(f.path)
        const lastOpen = makeLastOpen(f)
        const fileBasename = (!onFirebase && f.path && basename(f.path)) || ''
        let formattedPath = ''
        if (!onFirebase && f.path && !isTempFile(f.path)) {
          formattedPath = f.path
            .replace(fileBasename, '')
            .split(pathSep)
            .filter(Boolean)
            .join(' » ')
        } else {
          formattedPath = onFirebase ? '' : f.fileName
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
                    {onFirebase ? f.fileName : fileBasename.replace('.pltr', '')}
                  </div>
                  <div className="secondary-text">{formattedPath}</div>
                </div>
                <FileActions
                  missing={!!missing}
                  id={f.id || id}
                  fileName={f.fileName}
                  filePath={f.path || f.id}
                  openFile={openFile}
                  permission={f.permission}
                  isCloudFile={f.isCloudFile}
                />
              </div>
            </Cell>
            {f.permission ? (
              <Cell>{renderPermission(f.permission)}</Cell>
            ) : fileWithPermissionsExists ? (
              <Cell> </Cell>
            ) : null}
            <Cell>
              <div className="lastOpen">{t('{date, date, monthDay}', { date: lastOpen })}</div>
            </Cell>
          </Row>
        )
      })

      return renderedFiles ? (
        <div className="dashboard__recent-files__table">
          <StickyTable leftStickyColumnCount={0}>
            <Row>
              <Cell>{t('Name')}</Cell>
              {fileWithPermissionsExists ? <Cell>{t('Permission')}</Cell> : null}
              <Cell>{t('Last opened by you')}</Cell>
            </Row>
            {renderedFiles}
          </StickyTable>
        </div>
      ) : (
        <Spinner />
      )
    }

    return (
      <div className="dashboard__recent-files">
        <RecentsHeader setSearchTerm={setSearchTerm} />
        {renderRecents() || <Spinner />}
      </div>
    )
  }

  RecentFiles.propTypes = {
    fileList: PropTypes.array.isRequired,
    isOffline: PropTypes.bool,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      fileList: selectors.fileListSelector(state.present),
      isOffline: selectors.isOfflineSelector(state.present),
    }))(RecentFiles)
  }

  throw new Error('Could not connect RecentFiles')
}

export default RecentFilesConnector
