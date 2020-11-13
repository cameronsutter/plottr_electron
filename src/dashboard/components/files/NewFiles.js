import React from 'react'
import { IoIosBrowsers, IoMdBook, IoIosDocument, IoIosDesktop } from 'react-icons/io'
import t from 'format-message'
import { createNew, openExistingFile } from '../../utils/window_manager'

export default function NewFiles (props) {

  const createBlank = () => {
    try {
      createNew(null)
    } catch (error) {
      // TODO: tell the user something went wrong
      console.error(error)
    }
  }

  return <div className='dashboard__new-files'>
    <h1>{t('Create a New File')}</h1>
    <div className='dashboard__new-files__wrapper'>
      <div className='dashboard__new-files__item icon' onClick={createBlank}>
        <IoIosDocument />
        <div>{t('New Blank Project')}</div>
      </div>
      <div className='dashboard__new-files__item icon' onClick={() => openExistingFile()}>
        <IoIosDesktop />
        <div>{t('Open Existing')}</div>
      </div>
      <div className='dashboard__new-files__item icon'>
        <IoIosBrowsers />
        <div>{t('New From Template')}</div>
      </div>
      <div className='dashboard__new-files__item icon'>
        <IoMdBook/>
        <div>{t('New From Import')}</div>
      </div>
    </div>
  </div>
}
