import request from 'request'
import storage from 'electron-json-storage'
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { shell } from 'electron'
import { Button, Input, Checkbox, Row, Col, Glyphicon } from 'react-bootstrap'

const SUCCESS = 'success'
const OFFLINE = 'offline'
const ERROR = 'error'
const RED = 'bg-danger'
const GREEN = 'bg-success'

class ReportView extends Component {
  constructor (props) {
    super(props)
    var alertConst = ''
    var showAlert = false
    var connected = navigator.onLine
    if (!connected) alertConst = OFFLINE
    var alertText = this.makeAlertText(alertConst)
    if (alertText) showAlert = true
    this.state = {showAlert: showAlert, alertText: alertText, alertClass: RED, spinnerHidden: true, issueURL: null}
  }

  makeAlertText (value) {
    if (value === SUCCESS) {
      return 'Success! Your issue has been saved. Thanks!'
    } else if (value === OFFLINE) {
      return 'It looks like you\'re not online. You don\'t always have to be online to user Plottr, but it can\'t report a problem offline'
    } else if (value === ERROR) {
      return 'Hmmmm. For some reason that didn\'t work. Try again.'
    } else {
      return null
    }
  }

  sendIssue (title, body, feature) {
    var tags = ['user reported']
    if (feature) tags.push('enhancement')
    else tags.push('bug')

    var req = {
      url: 'https://maker.ifttt.com/trigger/plottr_electron_issue/with/key/cRXNfmbMn9nBIU8G7S964r',
      method: 'POST',
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Plottr'
      },
      body: {
        value1: title,
        value2: body,
        value3: tags
      }
    }

    const view = this
    request(req, function (err, response, body) {
      var newState = {spinnerHidden: true}
      if (err || response.statusCode !== 200) {
        Object.assign(newState, {showAlert: true, alertText: view.makeAlertText(ERROR)})
      } else {
        var state = {
          showAlert: true,
          alertClass: GREEN,
          alertText: view.makeAlertText(SUCCESS),
          issueURL: 'https://github.com/cameronsutter/plottr_electron/issues'
        }
        Object.assign(newState, state)
      }
      view.setState(newState)
    })
  }

  handleSend () {
    if (navigator.onLine) {
      var title = ReactDOM.findDOMNode(this.refs.title).children[0].value
      var body = ReactDOM.findDOMNode(this.refs.body).children[0].value
      var feature = ReactDOM.findDOMNode(this.refs.feature).children[0].children[0].children[0].checked
      if (body != '') {
        this.setState({spinnerHidden: false})
        this.sendIssue(title, body, feature)
      }
    } else {
      this.setState({showAlert: true, alertText: this.makeAlertText(OFFLINE)})
    }

  }

  handleLink () {
    shell.openExternal(this.state.issueURL)
  }

  render () {
    var body = null
    if (this.state.issueURL) {
      body = this.renderLink()
    } else {
      body = this.renderForm()
    }
    return (<div>
      <button className='close report' dangerouslySetInnerHTML={{__html: '&times;'}} onClick={() => window.close()} />
      <h1>Report a Problem</h1>
      <h6>(or request a feature)</h6>
      <hr style={{borderTop: '1px solid #ddd'}} />
      { body }
    </div>)
  }

  renderForm () {
    return (<div>
      <Row>
        <Col sm={5}>
          <p className='right'>Title</p>
        </Col>
        <Col sm={6}>
          <Input type='text' ref='title' />
        </Col>
      </Row>
      <Row>
        <Col sm={5}>
          <p className='right'>Describe the problem or feature</p>
        </Col>
        <Col sm={6}>
          <Input type='textarea' rows='8' ref='body' help='The more details you can give, the better I can help fix it' />
        </Col>
      </Row>
      <Row>
        <Col sm={5}>
          <p className='right'>Is this a feature request?</p>
        </Col>
        <Col sm={6} >
          <div className='left' >
            <Input type='checkbox' label='Feature request' ref='feature' />
          </div>
        </Col>
      </Row>
      <Row>
        <Col sm={8}>
        </Col>
        <Col sm={1}>
          <span style={{verticalAlign: '-50%'}} className={this.state.spinnerHidden ? 'hidden' : ''}><Glyphicon id='spinner' glyph='refresh'/></span>
        </Col>
        <Col sm={2}>
          <div className='right'>
            <Button onClick={this.handleSend.bind(this)} bsStyle='primary' bsSize='large' >Send</Button>
          </div>
        </Col>
      </Row>
      <Row>
        { this.renderAlert() }
      </Row>
    </div>)
  }

  renderLink () {
    return (<div>
      <Row>
        { this.renderAlert() }
      </Row>
      <Row>
        <p>You can view all known issues here:</p>
        <Button onClick={this.handleLink.bind(this)} bsStyle='link' bsSize='large'>{this.state.issueURL}</Button>
      </Row>
    </div>)
  }

  renderAlert () {
    if (this.state.showAlert && this.state.alertText) {
      return <p id='alert' className={this.state.alertClass}>{this.state.alertText}</p>
    } else {
      return null
    }
  }
}

// github token: 4cb9cbf71f2695992f49a6d2b4d85e40d6a6f4c1

ReportView.propTypes = {

}

export default ReportView
