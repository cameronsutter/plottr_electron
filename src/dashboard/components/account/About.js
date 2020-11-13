import React from 'react'
import electron from 'electron'
import t from 'format-message'
import { Button } from 'react-bootstrap'
const app = electron.remote.app

export default function About (props) {

  return <div className='dashboard__about'>
    <h1>{t('About Plottr')}</h1>
    <div className='dashboard__about__wrapper'>
      <dl className='dl-horizontal'>
        <dt>{t('Version')}</dt>
        <dd>{app.getVersion()}</dd>
        <dt>{t('Updates')}</dt>
        <dd><Button bsSize='small'>{t('Check for Updates')}</Button></dd>
      </dl>
      <dl className='dl-horizontal'>
        <dt>{t('Created By')}</dt>
        <dd>{t('Fictional Devices LLC')}</dd>
        <dd>{t('Crafted in the Mountains of Utah')}</dd>
      </dl>
    </div>
  </div>
}