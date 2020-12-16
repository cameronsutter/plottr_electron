import React from 'react'
import { shell, remote } from 'electron'
import t from 'format-message'
import { Button } from 'react-bootstrap'
import SETTINGS from '../../../common/utils/settings'
import MPQ from '../../../common/utils/MPQ'
const app = remote.app
const autoUpdater = remote.require('electron-updater').autoUpdater

export default function About (props) {
  const checkForUpdates = () => {
    if (process.env.NODE_ENV == 'development') return
    MPQ.push('btn_check_for_updates')
    // SETTINGS.set('user.seeCheckingForUpdates', true) // only show the checking when user asks to see it
    autoUpdater.autoDownload = SETTINGS.get('user.autoDownloadUpdate')
    autoUpdater.checkForUpdates()
  }

  const seeChangelog = () => {
    MPQ.push('btn_see_changelog')
    shell.openExternal('https://plottr.com/changelog')
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
        <dt>{t('Changelog')}</dt>
        <dd><a href='#' onClick={seeChangelog}>{t("See What's New")}</a></dd>
      </dl>
      <dl className='dl-horizontal'>
        <dt>{t('Created By')}</dt>
        <dd>{t('Fictional Devices LLC')}</dd>
        <dd>Cameron Sutter</dd>
        <dd>Ryan Zee</dd>
      </dl>
    </div>
  </div>
}