import React from 'react'
import { PropTypes } from 'prop-types'
import { t } from 'plottr_locales'
import { IoIosFolder } from 'react-icons/io'
import { Spinner } from '../../Spinner'
import Badge from 'reeact-bootstrap/Badge'

const FoldersConnector = (connector) => {
  const Folders = ({ selectFolder, folders, searchTerm }) => {
    if (searchTerm.length && !folders.length) return <p>{t('No Matches')}</p>
    if (!folders.length) return <Spinner />

    const renderedFolders = folders.map((f, index) => {
      try {
        const dateStr = t('{date, date, medium}', {
          date: f.date instanceof Date ? f.date : new Date(f.date.replace(/_/g, '-')),
        })
        return (
          <div
            key={index}
            className="dashboard__backups__item icon"
            onClick={() => selectFolder(f)}
          >
            <div>
              <IoIosFolder />
              <Badge>
                {
                  f.backups.filter((folder) => {
                    return typeof folder === 'string' || typeof folder?.fileName === 'string'
                  }).length
                }
              </Badge>
            </div>
            <div>{dateStr}</div>
          </div>
        )
      } catch (error) {
        return null
      }
    })

    return renderedFolders
  }

  Folders.propTypes = {
    selectFolder: PropTypes.func.isRequired,
    folders: PropTypes.array.isRequired,
    searchTerm: PropTypes.string.isRequired,
  }

  return Folders
}

export default FoldersConnector
