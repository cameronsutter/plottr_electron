import React, { useState } from 'react'
import { IoIosBrowsers, IoMdBook, IoIosDocument, IoIosDesktop } from 'react-icons/io'
import t from 'format-message'
import cx from 'classnames'
import { createNew, openExistingFile } from '../../utils/window_manager'

export default function NewFiles ({activeView, toggleView}) {

  const wrapFunc = (func) => {
    return () => {
      try {
        func()
      } catch (error) {
        // TODO: tell the user something went wrong
        console.error(error)
      }
    }
  }

  return <div className='dashboard__new-files'>
    <h1>{t('Create a New File')}</h1>
    <div className='dashboard__new-files__wrapper'>
      <div className='dashboard__new-files__item icon' onClick={wrapFunc(() => createNew(null))}>
        <IoIosDocument />
        <div>{t('New Blank Project')}</div>
      </div>
      <div className='dashboard__new-files__item icon' onClick={wrapFunc(openExistingFile)}>
        <IoIosDesktop />
        <div>{t('Open Existing')}</div>
      </div>
      <div className={cx('dashboard__new-files__item icon', {active: activeView == 'templates'})} onClick={() => toggleView('templates')}>
        <IoIosBrowsers />
        <div>{t('New From Template')}</div>
      </div>
      <div className={cx('dashboard__new-files__item icon', {active: activeView == 'import'})} onClick={() => toggleView('import')}>
        <IoMdBook/>
        <div>{t('New From Import')}</div>
      </div>
    </div>
  </div>
}
