import React from 'react'
import PropTypes from 'react-proptypes'
import { IoIosBrowsers, IoIosDocument } from 'react-icons/io'
import { FaRegSnowflake } from 'react-icons/fa'
import { VscFolderOpened } from 'react-icons/vsc'
import { t } from 'plottr_locales'
import cx from 'classnames'
import { Col, Grid, Row } from 'react-bootstrap'

import { checkDependencies } from '../../checkDependencies'

const NewFilesConnector = (connector) => {
  const {
    platform: {
      file: { createNew, openExistingFile },
      dialog,
      log,
      mpq,
      os,
    },
  } = connector
  checkDependencies({ createNew, openExistingFile, dialog, log, mpq, os })

  const NewFiles = ({ activeView, toggleView, doImport }) => {
    const wrapFunc = (type, func) => {
      return () => {
        mpq.push(`btn_${type}`)
        try {
          func()
        } catch (error) {
          log.error(error)
          dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        }
      }
    }

    return (
      <Grid fluid className="dashboard__new-files">
        <Row>
          <Col xs={3}>
            <div
              className="dashboard__new-files__item icon"
              onClick={wrapFunc('create_new', () => createNew(null))}
            >
              <IoIosDocument />
              <div>{t('New Project')}</div>
            </div>
          </Col>
          <Col xs={3}>
            <div
              className={cx('dashboard__new-files__item icon', {
                active: activeView == 'templates',
              })}
              onClick={() => toggleView('templates')}
            >
              <IoIosBrowsers />
              <div>{t('From Template')}</div>
            </div>
          </Col>
          <Col xs={3}>
            <div
              className="dashboard__new-files__item icon"
              onClick={wrapFunc('open_existing', openExistingFile)}
            >
              <VscFolderOpened />
              <div>{t('From File')}</div>
            </div>
          </Col>
          {os == 'unknown' ? null : (
            <Col xs={3}>
              <div
                className={cx('dashboard__new-files__item icon', {
                  active: activeView == 'import',
                })}
                onClick={doImport}
              >
                <FaRegSnowflake />
                <div>{t('Import Snowflake Pro')}</div>
              </div>
            </Col>
          )}
        </Row>
      </Grid>
    )
  }

  NewFiles.propTypes = {
    activeView: PropTypes.string,
    toggleView: PropTypes.func,
    doImport: PropTypes.func,
  }

  return NewFiles
}

export default NewFilesConnector
