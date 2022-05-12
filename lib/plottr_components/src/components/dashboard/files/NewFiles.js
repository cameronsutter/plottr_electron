import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { IoIosBrowsers, IoIosDocument } from 'react-icons/io'
import { BiImport } from 'react-icons/bi'
import { VscCloudUpload } from 'react-icons/vsc'
import cx from 'classnames'
import { Dropdown, MenuItem } from 'react-bootstrap'

import { t } from 'plottr_locales'

import Grid from '../../Grid'
import Col from '../../Col'
import Row from '../../Row'
import InputModal from '../../dialogs/InputModal'
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

  const NewFiles = ({ activeView, toggleView, doSnowflakeImport, doScrivenerImport, isOnWeb }) => {
    const [namingFile, setNamingFile] = useState(false)

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

    const createNewProj = wrapFunc('create_new', () => setNamingFile(true))
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

    const handleNameInput = useCallback(
      (value) => {
        setNamingFile(false)
        createNew(null, value)
      },
      [setNamingFile]
    )
    const cancelNameInput = useCallback(() => {
      setNamingFile(false)
    }, [setNamingFile])

    const NameFile = () => {
      if (!namingFile) return null

      return (
        <InputModal
          title={t('Name Your Project:')}
          getValue={handleNameInput}
          cancel={cancelNameInput}
          isOpen={true}
          type="text"
          customOkButtonText={t('Save')}
        />
      )
    }

    return (
      <>
        <NameFile />
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
            {isOnWeb ? null : (
              <Col xs={3}>
                <Dropdown
                  className={cx('dashboard__new-files__item icon import-file', {
                    active: activeView == 'import',
                  })}
                >
                  <Dropdown.Toggle noCaret>
                    <BiImport />
                    <div>{t('Import File')}</div>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <MenuItem onSelect={doScrivenerImport}>{t('Scrivener')}</MenuItem>
                    <MenuItem onSelect={doSnowflakeImport}>{t('Snowflake Pro')}</MenuItem>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            )}
          </Row>
        </Grid>
      </>
    )
  }

  NewFiles.propTypes = {
    activeView: PropTypes.string,
    toggleView: PropTypes.func,
    doSnowflakeImport: PropTypes.func,
    doScrivenerImport: PropTypes.func,
    isOnWeb: PropTypes.bool,
  }

  return NewFiles
}

export default NewFilesConnector
