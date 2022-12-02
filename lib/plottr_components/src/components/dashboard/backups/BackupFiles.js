import React from 'react'
import PropTypes from 'react-proptypes'
import { IoIosDocument } from 'react-icons/io'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import { checkDependencies } from '../../checkDependencies'

const safelyDecodeURI = (str) => {
  try {
    return decodeURIComponent(str)
  } catch (error) {
    return str
  }
}

const truncateTitle = (title) => {
  if (!title) {
    return t('Untitled')
  }
  if (title.length > 80) {
    return `${title.slice(0, 80)}...`
  }
  return safelyDecodeURI(title)
}

const BackupFilesConnector = (connector) => {
  const {
    platform: {
      mpq,
      showItemInFolder,
      file: { joinPath },
      log,
    },
  } = connector
  checkDependencies({ mpq, showItemInFolder, joinPath, log })

  const BackupFiles = ({ folder, searchTerm }) => {
    const openInFolder = (fileURL) => {
      // mpq.push('btn_open_backup')
      showItemInFolder(fileURL)
    }

    const fileNameFromPath = (name) => {
      if (name.includes('(start-session)-')) {
        const nameSansStart = name.replace('(start-session)-', '')
        return (
          <p>
            <strong>{t('Session Start')}</strong>
            <br />
            <span>{truncateTitle(nameSansStart)}</span>
          </p>
        )
      } else {
        return <p>{truncateTitle(name)}</p>
      }
    }

    const fileNameFromStorageObject = (storageObject) => {
      if (storageObject.startOfSession) {
        const nameSansStart = storageObject.fileName
        return (
          <p title={nameSansStart}>
            <strong>{t('Session Start')}</strong>
            <br />
            <span>{truncateTitle(nameSansStart)}</span>
          </p>
        )
      } else {
        return <p title={storageObject.fileName}>{truncateTitle(storageObject.fileName)}</p>
      }
    }

    const renderedFiles = folder.backups.reduce((acc, b, index) => {
      const isCloudBackup = b.storagePath
      const fileName = isCloudBackup ? b.fileName?.toLowerCase() : b.toLowerCase()
      if (fileName?.includes(searchTerm.toLowerCase())) {
        return [
          ...acc,
          <div
            key={index}
            className="dashboard__backups__item icon"
            onClick={() => {
              const filePathPromise = isCloudBackup
                ? Promise.resolve(b.storagePath)
                : joinPath(folder.path, b)
              filePathPromise.then((filePath) => {
                const fileURL = helpers.file.isProtocolString(filePath)
                  ? filePath
                  : helpers.file.filePathToFileURL(filePath)
                if (!fileURL) {
                  const message = `Couldn't create fileURL for backup with path: ${filePath}`
                  log.error(message)
                  return
                }
                openInFolder(fileURL)
              })
            }}
          >
            <IoIosDocument />
            <div className="dashboard__backups__item__title">
              {isCloudBackup ? fileNameFromStorageObject(b) : fileNameFromPath(b)}
            </div>
          </div>,
        ]
      }
      return acc
    }, [])

    if (renderedFiles && renderedFiles.length) {
      return renderedFiles
    }
    return <p>{t('No Matches')}</p>
  }

  BackupFiles.propTypes = {
    folder: PropTypes.shape({ backups: PropTypes.array, path: PropTypes.string }),
    searchTerm: PropTypes.string,
  }

  return BackupFiles
}

export default BackupFilesConnector
