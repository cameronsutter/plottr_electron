import React, { useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { IoIosBrowsers, IoIosDocument } from 'react-icons/io'
import { BiImport } from 'react-icons/bi'
import { VscCloudUpload } from 'react-icons/vsc'
import cx from 'classnames'

import { t } from 'plottr_locales'

import MenuItem from '../../MenuItem'
import Dropdown from '../../Dropdown'
import Grid from '../../Grid'
import Col from '../../Col'
import Row from '../../Row'
import { checkDependencies } from '../../checkDependencies'

const NewFilesConnector = (connector) => {
  const {
    platform: {
      file: { openExistingFile },
      showErrorBox,
      log,
      mpq,
      os,
    },
  } = connector
  checkDependencies({ openExistingFile, showErrorBox, log, mpq, os })

  const NewFiles = ({
    activeView,
    toggleView,
    doSnowflakeImport,
    doScrivenerImport,
    isOnWeb,
    isInOfflineMode,
    doCreateNewProject,
  }) => {
    const wrapFunc = (type, func) => {
      return () => {
        mpq.push(`btn_${type}`)
        try {
          func()
        } catch (error) {
          log.error(error)
          showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        }
      }
    }

    const fromExisting = () => {
      if (isInOfflineMode) return

      wrapFunc('open_existing', openExistingFile)()
    }

    useEffect(() => {
      const fromTempl = document.addEventListener('from-template', () => toggleView('templates'))
      const openEx = document.addEventListener('open-existing', fromExisting)
      return () => {
        document.removeEventListener('from-template', fromTempl)
        document.removeEventListener('open-existing', openEx)
      }
    }, [])

    return (
      <>
        <Grid fluid className="dashboard__new-files">
          <Row>
            <Col xs={isOnWeb ? 4 : 3}>
              <div
                className={cx('dashboard__new-files__item icon', {
                  disabled: isInOfflineMode,
                })}
                onClick={doCreateNewProject}
              >
                <IoIosDocument />
                <div>{t('Create Blank Project')}</div>
              </div>
            </Col>
            <Col xs={isOnWeb ? 4 : 3}>
              <div
                className={cx('dashboard__new-files__item icon', {
                  active: activeView == 'templates',
                  disabled: isInOfflineMode,
                })}
                onClick={() => toggleView('templates')}
              >
                <IoIosBrowsers />
                <div>{t('Create From Template')}</div>
              </div>
            </Col>
            <Col xs={isOnWeb ? 4 : 3}>
              <div
                className={cx('dashboard__new-files__item icon', {
                  disabled: isInOfflineMode,
                })}
                onClick={fromExisting}
              >
                <VscCloudUpload />
                <div>
                  {os() == 'unknown' ? t('Upload Existing Project') : t('Open Existing File')}
                </div>
              </div>
            </Col>
            {isOnWeb ? null : (
              <Col xs={3}>
                <Dropdown
                  id="new-files-dropdown"
                  className={cx('dashboard__new-files__item icon import-file', {
                    active: activeView == 'import',
                    disabled: isInOfflineMode,
                  })}
                  disabled={isInOfflineMode}
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
    doCreateNewProject: PropTypes.func,
    isOnWeb: PropTypes.bool,
    isInOfflineMode: PropTypes.bool,
  }

  return NewFiles
}

export default NewFilesConnector
