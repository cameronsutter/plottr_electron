import React, { useState } from 'react'
import { IoIosBrowsers, IoMdBook, IoIosDocument, IoIosDesktop } from 'react-icons/io'
import { FaRegSnowflake } from 'react-icons/fa'
import t from 'format-message'
import cx from 'classnames'
import { createNew, openExistingFile } from '../../utils/window_manager'
import MPQ from '../../../common/utils/MPQ'

export default function NewFiles ({activeView, toggleView, doImport}) {

  const wrapFunc = (type, func) => {
    return () => {
      MPQ.push(`btn_${type}`)
      try {
        func()
      } catch (error) {
        // TODO: tell the user something went wrong
        console.error(error)
      }
    }
  }

  return <div className='dashboard__new-files'>
    <div className='dashboard__new-files__wrapper'>
      <div className='dashboard__new-files__item icon' onClick={wrapFunc('create_new', () => createNew(null))}>
        <IoIosDocument />
        <div>{t('Create Blank Project')}</div>
      </div>
      <div className='dashboard__new-files__item icon' onClick={wrapFunc('open_existing', openExistingFile)}>
        <IoIosDesktop />
        <div>{t('Open Existing')}</div>
      </div>
      <div className={cx('dashboard__new-files__item icon', {active: activeView == 'templates'})} onClick={() => toggleView('templates')}>
        <IoIosBrowsers />
        <div>{t('Create From Template')}</div>
      </div>
      <div className={cx('dashboard__new-files__item icon', {active: activeView == 'import'})} onClick={doImport}>
        <FaRegSnowflake/>
        <div>{t('Import Snowflake Pro')}</div>
      </div>
    </div>
  </div>
}
