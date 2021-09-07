import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { IoIosDocument } from 'react-icons/io'

const BackupFilesConnector = (connector) => {
  const {
    platform: {
      mpq,
      showItemInFolder,
      file: { joinPath },
    },
  } = connector

  const BackupFiles = ({ folder, searchTerm }) => {
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
        return <p>{name}</p>
      }
    }

    const renderedFiles = folder.backups.reduce((acc, b) => {
      if (b.toLowerCase().includes(searchTerm)) {
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
