import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import { Button } from 'react-bootstrap'
import i18n from 'format-message'
import VerifyView from './VerifyView'

export default class ChoiceView extends Component {
  state = {
    view: process.env.TRIALMODE ? 'verify' : 'chooser'
  }

  startFreeTrial = () => {
    ipcRenderer.send('start-free-trial')
  }

  renderBody () {
    if (this.state.view === 'chooser') {
      return <div className='verify__chooser'>
        <div className='verify__choice' onClick={() => this.setState({view: 'explain'})}>
          <h2>{i18n('I want to start the free trial')}</h2>
        </div>
        <div className='verify__choice' onClick={() => this.setState({view: 'verify'})}>
          <h2>{i18n('I have a license key')}</h2>
        </div>
      </div>
    } else if (this.state.view === 'verify') {
      return <VerifyView />
    } else {
      return <div>
        <p>{i18n('You\'ll have 30 days')}</p>
        <p>{i18n('Access to all the features')}</p>
        <p>{i18n('Create unlimited story files')}</p>
        <div style={{marginTop: '30px'}}>
          <Button bsSize='large' bsStyle='default' onClick={this.startFreeTrial}>{i18n('Start my Free Trial')}</Button>
        </div>
      </div>
    }
  }

  render () {
    return <div>
      <h1 className='verify'><img src='../icons/logo_28_100.png' className='verify' height='100'/> {i18n('Welcome to Plottr')}</h1>
      { this.renderBody() }
    </div>
  }
}