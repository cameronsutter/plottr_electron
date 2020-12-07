import React from 'react'
import { remote } from 'electron'
import t from 'format-message'
import { Button } from 'react-bootstrap'
import SETTINGS from '../../../common/utils/settings'
const app = remote.app
const autoUpdater = remote.require('electron-updater').autoUpdater

export default function About (props) {
  const checkForUpdates = () => {
    if (process.env.NODE_ENV == 'development') return
    autoUpdater.autoDownload = SETTINGS.get('user.autoUpdate')
    autoUpdater.checkForUpdates()
  }

  const renderUpdater = () => {
    if (SETTINGS.get('canGetUpdates')) {
      return <dd><Button bsSize='small' onClick={checkForUpdates}>{t('Check for Updates')}</Button></dd>
    } else {
      return <dd><span className='text-danger'>{t('Not Receiving Updates')}</span></dd>
    }
  }

  return <div className='dashboard__about'>
    <h1>{t('About Plottr')}</h1>
    <div className='dashboard__about__wrapper'>
      <dl className='dl-horizontal'>
        <dt>{t('Version')}</dt>
        <dd>{app.getVersion()}</dd>
        <dt>{t('Updates')}</dt>
        { renderUpdater() }
      </dl>
      <dl className='dl-horizontal'>
        <dt>{t('Created By')}</dt>
        <dd>{t('Fictional Devices LLC')}</dd>
        <dd>{t('Crafted in the Mountains of Utah')}</dd>
      </dl>
    </div>
  </div>
}