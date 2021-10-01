import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { IoIosDocument } from 'react-icons/io'
import { checkDependencies } from '../../checkDependencies'

const BackupFilesConnector = (connector) => {
  const {
    platform: {
      mpq,
      showItemInFolder,
      file: { joinPath },
    },
  } = connector
  checkDependencies({ mpq, showItemInFolder, joinPath })

  const BackupFiles = ({ folder, searchTerm }) => {
    const openInFolder = (filePath) => {
      mpq.push('btn_open_backup')
      showItemInFolder(filePath)
    }

    const fileNameFromPath = (name) => {
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

    const fileNameFromStorageObject = (storageObject) => {
      if (storageObject.startOfSession) {
        const nameSansStart = storageObject.fileName
        return (
          <p title={nameSansStart}>
            <strong>{t('Session Start')}</strong>
            <br />
            <span>{nameSansStart}</span>
          </p>
        )
      } else {
        return <p title={storageObject.fileName}>{storageObject.fileName}</p>
      }
    }

    const renderedFiles = folder.backups.reduce((acc, b) => {
      const isCloudBackup = b.storagePath
      const fileName = isCloudBackup ? b.fileName.toLowerCase() : b.toLowerCase()
      if (fileName.includes(searchTerm)) {
        const filePath = isCloudBackup ? b.storagePath : joinPath(folder.path, b)
        acc.push(
          <div
            key={b}
            className="dashboard__backups__item icon"
            onClick={() => openInFolder(filePath)}
          >
            <IoIosDocument />
            <div className="dashboard__backups__item__title">
              {isCloudBackup ? fileNameFromStorageObject(b) : fileNameFromPath(b)}
            </div>
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

  return BackupFiles
}

export default BackupFilesConnector
