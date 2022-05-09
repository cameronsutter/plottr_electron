import React from 'react'
import { PropTypes } from 'prop-types'
import { IoIosFolder } from 'react-icons/io'
import { Badge } from 'react-bootstrap'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import { Spinner } from '../../Spinner'

const FoldersConnector = (connector) => {
  const Folders = ({ selectFolder, folders, searchTerm }) => {
    if (searchTerm.length && !folders.length) return <p>{t('No Matches')}</p>
    if (!folders.length) return <Spinner />

    const renderedFolders = folders.map((f, index) => {
      try {
        const dateStr = t('{date, date, medium}', {
          date: f.date instanceof Date ? f.date : helpers.date.parseStringDate(f.date),
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
