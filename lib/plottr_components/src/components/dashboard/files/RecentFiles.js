import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { AiOutlineTeam, AiOutlineRead } from 'react-icons/ai'
import { GiQuillInk } from 'react-icons/gi'
import { FaSignal } from 'react-icons/fa'
import { isEqual, sortBy } from 'lodash'
import { StickyTable, Row, Cell } from 'react-sticky-table'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import MissingIndicator from './MissingIndicator'
import UnconnectedFileActions from './FileActions'
import RecentsHeader from './RecentsHeader'
import { checkDependencies } from '../../checkDependencies'
import { Spinner } from '../../Spinner'
import prettydate from 'pretty-date'

const oneDay = 1000 * 60 * 60 * 24

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

const safelyDecodeURI = (str) => {
  try {
    return decodeURIComponent(str)
  } catch (error) {
    return str
  }
}

const formatFileName = (fileName) => {
  const formattedFileName = fileName
  return safelyDecodeURI(formattedFileName)
}

const RecentFilesConnector = (connector) => {
  const {
    platform: {
      file: { doesFileExist, pathSep, basename, openKnownFile, listOfflineFiles },
      log,
    },
  } = connector
  checkDependencies({
    doesFileExist,
    pathSep,
    basename,
    openKnownFile,
    log,
    listOfflineFiles,
  })

  const FileActions = UnconnectedFileActions(connector)

  const RecentFiles = ({
    isInOfflineMode,
    resuming,
    sortedKnownFiles,
    loadingFileList,
    shouldBeInPro,
    offlineModeEnabled,
    isOnWeb,
    hasCurrentProLicense,
  }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [sortedFiles, setSortedFiles] = useState(sortedKnownFiles)
    const [missingFiles, setMissing] = useState([])
    const [selectedFile, selectFile] = useState(null)
    const today = new Date()

    useEffect(() => {
      setTimeout(() => {
        let newMissing = []
        sortedFiles.forEach((file) => {
          const fileURL = file.fileURL
          if (!fileURL) {
            return
          }
          if (helpers.file.isPlottrCloudFile(file)) {
            return
          }
          if (!doesFileExist(fileURL)) {
            newMissing.push(fileURL)
          }
        })
        setMissing(newMissing)
      }, 2000)
    }, [sortedFiles])

    useEffect(() => {
      if ((!isInOfflineMode && !resuming) || !shouldBeInPro) {
        const newSortedFiles = sortedKnownFiles.filter((file) => {
          return (file.fileName || '').toLowerCase().includes(searchTerm.toLowerCase())
        })
        if (!isEqual(newSortedFiles, sortedFiles)) {
          setSortedFiles(newSortedFiles)
        }
      } else if (offlineModeEnabled && isInOfflineMode) {
        listOfflineFiles()
          .then((offlineFiles) => {
            const sortedFilteredOfflineFiles = sortBy(
              offlineFiles.filter((file) => {
                return file.fileName.toLowerCase().includes(searchTerm)
              }),
              (file) => {
                return helpers.file.getDateValue(file)
              }
            )
            if (!isEqual(sortedFiles, sortedFilteredOfflineFiles)) {
              setSortedFiles(sortedFilteredOfflineFiles)
            }
          })
          .catch((error) => {
            setSortedFiles([])
            log.error('Failed to read offline files', error)
          })
      }
    }, [offlineModeEnabled, isInOfflineMode, resuming, searchTerm, sortedKnownFiles])

    const openFile = (fileURL) => {
      return openKnownFile(fileURL)
    }

    const renderRecents = () => {
      // TODO: if no files, show something different
      if (!isInOfflineMode && loadingFileList) return <Spinner />
      if (!sortedFiles.length) return <span>{t('No files found.')}</span>

      const fileWithPermissionsExists = Object.values(sortedFiles).some(
        ({ permission }) => permission
      )

      const renderLastOpenTime = (lastOpened) => {
        try {
          // less than a day, show something more helpful
          if (today.getTime() - lastOpened.getTime() < oneDay) {
            return prettydate.format(lastOpened)
          }

          // is exactly at 12 AM
          if (lastOpened.getHours() == 0) return null

          return t.time(lastOpened, 'medium')
        } catch (error) {
          log.error('Failed to compute last open time from', lastOpened, error)
          // no time value, do nothing
          return null
        }
      }

      const renderedFiles = sortedFiles.map((f, idx) => {
        if (!f) return null

        const isProFile = helpers.file.isPlottrCloudFile(f)
        const lastOpen = helpers.file.getDateValue(f)
        const withoutProtocol = helpers.file.withoutProtocol(f.fileURL)
        const fileBasename = (!isProFile && f.path && basename(withoutProtocol)) || ''
        let formattedPath = ''
        if (!isProFile && f.fileURL && !f.isTempFile) {
          formattedPath = withoutProtocol
            .replace(fileBasename, '')
            .split(pathSep)
            .filter(Boolean)
            .join(' » ')
        }
        let missing = null
        if (missingFiles.includes(f.fileURL)) {
          missing = <MissingIndicator />
        }
        const selected = selectedFile == f.fileURL
        return (
          <Row
            key={idx}
            onDoubleClick={() => {
              if (!missing) openFile(f.fileURL)
            }}
            onClick={() => selectFile(selected ? null : f.fileURL)}
            className={cx({ selected: selected })}
          >
            <Cell className={cx({ disabled: !!missing })}>
              <div className="dashboard__recent-files__file-cell">
                <div>
                  <div className="title">
                    {missing}
                    {f.isOfflineBackup ? (
                      <>
                        <FaSignal title="This is an offline backup of a Plottr cloud file" />{' '}
                      </>
                    ) : null}
                    {formatFileName(f.fileName)}
                  </div>
                  <div className="secondary-text">{formattedPath}</div>
                </div>
                <FileActions
                  missing={!!missing}
                  offline={f.isOfflineBackup}
                  id={f.fileURL}
                  fileName={f.fileName}
                  fileURL={f.fileURL}
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
            <Cell className={cx({ disabled: !!missing })}>
              <div className="lastOpen">
                <span>{t.date(lastOpen, 'monthDay')}</span>
                <span> </span>
                <span>{renderLastOpenTime(lastOpen)}</span>
              </div>
            </Cell>
          </Row>
        )
      })

      return (isInOfflineMode || !loadingFileList) && renderedFiles ? (
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
        <RecentsHeader
          setSearchTerm={setSearchTerm}
          hasCurrentProLicense={hasCurrentProLicense}
          isOnWeb={isOnWeb}
        />
        {renderRecents() || <Spinner />}
      </div>
    )
  }

  RecentFiles.propTypes = {
    isInOfflineMode: PropTypes.bool,
    resuming: PropTypes.bool,
    sortedKnownFiles: PropTypes.array.isRequired,
    loadingFileList: PropTypes.bool,
    shouldBeInPro: PropTypes.bool,
    offlineModeEnabled: PropTypes.bool,
    isOnWeb: PropTypes.bool,
    hasCurrentProLicense: PropTypes.bool,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      isInOfflineMode: selectors.isInOfflineModeSelector(state.present),
      resuming: selectors.isResumingSelector(state.present),
      sortedKnownFiles: selectors.flatSortedKnownFilesSelector(state.present),
      loadingFileList: selectors.fileListIsLoadingSelector(state.present),
      shouldBeInPro: selectors.shouldBeInProSelector(state.present),
      offlineModeEnabled: selectors.offlineModeEnabledSelector(state.present),
      isOnWeb: selectors.isOnWebSelector(state.present),
      hasCurrentProLicense: selectors.hasProSelector(state.present),
    }))(RecentFiles)
  }

  throw new Error('Could not connect RecentFiles')
}

export default RecentFilesConnector
