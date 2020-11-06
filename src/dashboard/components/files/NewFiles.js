import React from 'react'
import { IoIosBrowsers, IoMdBook, IoIosDocument } from 'react-icons/io'
import t from 'format-message'

export default function NewFiles (props) {
  return <div className='dashboard__new-files'>
    <h1>{t('Create a New File')}</h1>
    <div className='dashboard__new-files__wrapper'>
      <div className='dashboard__new-files__item icon'>
        <IoIosDocument />
        <div>{t('New Blank Project')}</div>
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
      // <div className='dashboard__new-files__item'>
      //   <img src='../icons/document_icon.png' className='' height='90'/>
      //   <div>{t('New Blank Document')}</div>
      // </div>