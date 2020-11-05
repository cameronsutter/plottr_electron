import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import t from 'format-message'
import VerifyView from './VerifyView'
import { useTrialStatus } from '../../../common/licensing/trial_manager'

export default function ChoiceView (props) {
  const { startTrial } = useTrialStatus()
  const [view, setView] = useState('chooser')

  const renderBody = () => {
    switch (view) {
      case 'chooser':
        return <div className='verify__chooser'>
          <div className='verify__choice' onClick={() => setView('explain')}>
            <h2>{t('I want to start the free trial')}</h2>
          </div>
          <div className='verify__choice' onClick={() => setView('verify')}>
            <h2>{t('I have a license key')}</h2>
          </div>
        </div>
      case 'verify':
        return <VerifyView goBack={() => setView('chooser')}/>
      case 'explain':
        return <div>
          <p>{t('You\'ll have 30 days')}</p>
          <p>{t('Access to all the features')}</p>
          <p>{t('Create unlimited story files')}</p>
          <div style={{marginTop: '30px'}}>
            <Button bsSize='large' bsStyle='default' onClick={() => setView('chooser')}>{t('Cancel')}</Button>
            <Button bsSize='large' bsStyle='default' onClick={startTrial}>{t('Start my Free Trial')}</Button>
          </div>
        </div>
    }
  }

  return <div>
    <h1 className='verify'><img src='../icons/logo_28_100.png' className='verify' height='100'/> {t('Welcome to Plottr')}</h1>
    { renderBody() }
  </div>
}