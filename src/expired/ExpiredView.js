import React, { Component } from 'react'
import { ipcRenderer } from 'electron'
import i18n from 'format-message'
import { Glyphicon } from 'react-bootstrap'
import storage from 'electron-json-storage'
import AdView from 'AdView'

export default class ExpiredView extends Component {
  state = {
    view: 'checking',
    canExtend: false
  }
  tryAgain = true

  componentWillMount () {
    this.checkTrialInfo()
  }

  checkTrialInfo = () => {
    storage.get('trial_info', (err, data) => {
      console.log(err)
      console.log(data)
      if (err) {
        if (this.tryAgain) {
          this.tryAgain = false
          this.checkTrialInfo()
        }
      } else {
        this.setState({view: 'choose', canExtend: data.extensions > 0})
      }
    })
  }

  buy = () => {
    ipcRenderer.send('open-buy-window')
  }

  renderChoices () {
    if (this.state.canExtend) {
      return <div className='expired__chooser'>
        <div className='expired__choice' onClick={this.buy}>
          <h2>{i18n('I want to buy the full version!')}</h2>
        </div>
        <div className='expired__choice' onClick={() => this.setState({view: 'ad'})}>
          <h2>{i18n('Can I have a few more days?')}</h2>
        </div>
      </div>
    } else {
      return <div style={{margin: '35px'}}>
        <h3><a href='#' onClick={this.buy}>{i18n('Click here to get the full version')}</a></h3>
        <p style={{padding: '10px 70px'}}>{i18n('Don\'t worry, all your work is saved in plottr_trial.pltr in your Documents folder')}</p>
      </div>
    }
  }

  render () {
    if (this.state.view === 'choose') {
      return <div>
        <h1 className='expired'><img src='../icons/logo_28_100.png' className='verify' height='100'/> {i18n('Thanks for trying Plottr')}</h1>
        <h2>{i18n('Your free trial has expired')} 😭</h2>
        { this.renderChoices() }
        <p>{i18n('Please contact me with any questions at family@plottrapp.com')}</p>
      </div>
    } else if (this.state.view === 'ad') {
      return <AdView />
    } else {
      return <span style={{ fontSize: '40px', marginTop: '100px' }}><Glyphicon id='spinner' glyph='refresh'/></span>
    }
  }
}