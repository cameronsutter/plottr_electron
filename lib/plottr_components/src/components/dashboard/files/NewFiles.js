import React, { useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { IoIosBrowsers, IoIosDocument } from 'react-icons/io'
import { FaRegSnowflake } from 'react-icons/fa'
import { VscCloudUpload } from 'react-icons/vsc'
import { t } from 'plottr_locales'
import cx from 'classnames'
import { Col, Dropdown, Grid, MenuItem, Row } from 'react-bootstrap'

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

  const NewFiles = ({ activeView, toggleView, doSnowflakeImport, doScrivenerImport }) => {
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

    const createNewProj = wrapFunc('create_new', () => createNew(null))
    const fromExisting = wrapFunc('open_existing', openExistingFile)

    useEffect(() => {
      const newProj = document.addEventListener('new-project', createNewProj)
      const fromTempl = document.addEventListener('from-template', () => toggleView('templates'))
      const openEx = document.addEventListener('open-existing', fromExisting)
      return () => {
        document.removeEventListener('new-project', newProj)
        document.removeEventListener('from-template', fromTempl)
        document.removeEventListener('open-existing', openEx)
      }
    }, [])

    return (
      <Grid fluid className="dashboard__new-files">
        <Row>
          <Col xs={3}>
            <div className="dashboard__new-files__item icon" onClick={createNewProj}>
              <IoIosDocument />
              <div>{t('Create Blank Project')}</div>
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
              <div>{t('Create From Template')}</div>
            </div>
          </Col>
          <Col xs={3}>
            <div className="dashboard__new-files__item icon" onClick={fromExisting}>
              <VscCloudUpload />
              <div>
                {os() == 'unknown' ? t('Upload Existing Project') : t('Open Existing File')}
              </div>
            </div>
          </Col>
          {os() == 'unknown' ? null : (
            <Col xs={3}>
              <Dropdown
                className={cx('dashboard__new-files__item icon pro-import', {
                  active: activeView == 'import',
                })}
              >
                <Dropdown.Toggle noCaret>
                  <FaRegSnowflake />
                  <div>{t('Import')}</div>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <MenuItem onSelect={doSnowflakeImport}>{t('Snowflake Pro')}</MenuItem>
                  <MenuItem onSelect={doScrivenerImport}>{t('Scrivener Project')}</MenuItem>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          )}
        </Row>
      </Grid>
    )
  }

  NewFiles.propTypes = {
    activeView: PropTypes.string,
    toggleView: PropTypes.func,
    doSnowflakeImport: PropTypes.func,
    doScrivenerImport: PropTypes.func,
  }

  return NewFiles
}

export default NewFilesConnector
