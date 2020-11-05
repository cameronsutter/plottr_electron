import React, { useState, useEffect } from 'react'
import { ipcRenderer, shell } from 'electron'
import i18n from 'format-message'
import { Glyphicon } from 'react-bootstrap'
import storage from 'electron-json-storage'
import AdView from './AdView'
import { useTrialStatus } from '../../../common/licensing/trial_manager'
import VerifyView from './VerifyView'

export default function ExpiredView (props) {
  const {started, expired, canExtend} = useTrialStatus()
  const [view, setView] = useState('chooser')

  useEffect(() => {
    if (started && expired) {
      setCanExtend()
    }
  }, [started])

  const buy = () => {
    shell.openExternal("https://getplottr.com/pricing/")
  }

  const renderChoices = () => {
    if (canExtend) {
      return <div className='expired__chooser'>
        <div className='expired__choice' onClick={() => setView('verify')}>
          <h2>{i18n('I have a license key')}</h2>
        </div>
        <div className='expired__choice' onClick={() => setView('ad')}>
          <h2>{i18n('Can I have a few more days?')}</h2>
        </div>
      </div>
    } else {
      // return <div style={{margin: '35px', marginTop: '20px'}}>
      //   <h3><a href='#' onClick={this.buy}>{i18n('Get the full version')}</a>{' '}<a href='#' onClick={this.verify}>{i18n('Or verify your license')}</a></h3>
      //   <p></p>
      //   <p style={{padding: '10px 70px'}}>{i18n('Don\'t worry, all your work is saved in plottr_trial.pltr in your Documents folder')}</p>
      // </div>
      return <div>
        <p style={{padding: '5px 70px'}}>{i18n('Don\'t worry, all your work is saved in plottr_trial.pltr in your Documents folder')}</p>
        <div className='expired__chooser' style={{marginBottom: '20px'}}>
          <div className='expired__choice' onClick={buy}>
            <h2>{i18n('I want to buy the full version!')}</h2>
          </div>
          <div className='expired__choice' onClick={() => setView('verify')}>
            <h2>{i18n('I have a license key')}</h2>
          </div>
        </div>
      </div>
    }
  }

  if (view == 'chooser') {
    return <div>
      <h1 className='expired'><img src='../icons/logo_28_100.png' className='verify' height='100'/> {i18n('Thanks for trying Plottr')}</h1>
      <h2>{i18n('Your free trial has expired')} 😭</h2>
      { renderChoices() }
      <p>{i18n('Please contact me with any questions at support@getplottr.com')}</p>
    </div>
  } else if (view == 'ad') {
    return <AdView />
  } else if (view == 'verify') {
    return <VerifyView goBack={() => setView('chooser')}/>
  }
}