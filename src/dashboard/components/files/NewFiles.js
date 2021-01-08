import React, { useState } from 'react'
import { IoIosBrowsers, IoMdBook, IoIosDocument, IoIosDesktop } from 'react-icons/io'
import { FaRegSnowflake } from 'react-icons/fa'
import t from 'format-message'
import cx from 'classnames'
import { createNew, openExistingFile } from '../../utils/window_manager'
import MPQ from '../../../common/utils/MPQ'
import { Col, Grid, Row, Clearfix } from 'react-bootstrap'
import log from 'electron-log'
import { remote } from 'electron'
const { dialog } = remote

export default function NewFiles ({activeView, toggleView, doImport}) {

  const wrapFunc = (type, func) => {
    return () => {
      MPQ.push(`btn_${type}`)
      try {
        func()
      } catch (error) {
        log.error(error)
        dialog.showErrorBox(t('There was an error doing that. Try again'))
      }
    }
  }

  return <Grid fluid className='dashboard__new-files'>
    <Row>
      <Col xs={6} md={3}>
        <div className='dashboard__new-files__item icon' onClick={wrapFunc('create_new', () => createNew(null))}>
          <IoIosDocument />
          <div>{t('Create Blank Project')}</div>
        </div>
      </Col>
      <Col xs={6} md={3}>
        <div className='dashboard__new-files__item icon' onClick={wrapFunc('open_existing', openExistingFile)}>
          <IoIosDesktop />
          <div>{t('Open Existing')}</div>
        </div>
      </Col>
      <Clearfix visibleSmBlock visibleXsBlock />
      <Col xs={6} md={3}>
        <div className={cx('dashboard__new-files__item icon', {active: activeView == 'templates'})} onClick={() => toggleView('templates')}>
          <IoIosBrowsers />
          <div>{t('Create From Template')}</div>
        </div>
      </Col>
      <Col xs={6} md={3}>
        <div className={cx('dashboard__new-files__item icon', {active: activeView == 'import'})} onClick={doImport}>
          <FaRegSnowflake/>
          <div>{t('Import Snowflake Pro')}</div>
        </div>
      </Col>
    </Row>
  </Grid>
}
