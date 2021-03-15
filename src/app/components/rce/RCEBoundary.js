import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import setupRollbar from '../../../common/utils/rollbar'
import log from 'electron-log'
import { t as i18n } from 'plottr_locales'
import { Button } from 'react-bootstrap'
import { IoIosAlert } from 'react-icons/io'
import { createErrorReport } from '../../../common/utils/error_reporter'
import { shell } from 'electron'
const rollbar = setupRollbar('ErrorBoundary')

export default class RCEBoundary extends Component {
  state = { hasError: false, viewError: false, count: 0 }

  static propTypes = {
    children: PropTypes.node,
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, viewError: false }
  }

  componentDidCatch(error, errorInfo) {
    this.error = error
    this.errorInfo = errorInfo
    log.error(error, errorInfo)
    rollbar.error(error, errorInfo)
  }

  createReport = () => {
    createErrorReport(this.error, this.errorInfo)
  }

  goToSupport = () => {
    shell.openExternal('https://plottr.com/support/')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary rce">
          <div className="text-center">
            <h4>
              <IoIosAlert />
              {i18n('Text Error')}
            </h4>
          </div>
          <div className="error-boundary__options">
            <Button
              bsStyle="warning"
              onClick={() => this.setState({ hasError: false, count: this.state.count + 1 })}
            >
              {i18n('Try that again')}
            </Button>
            <Button onClick={() => this.setState({ viewError: !this.state.viewError })}>
              {i18n('View Error')}
            </Button>
          </div>
          {this.state.count > 0 ? (
            <div className="text-center well">
              <Button onClick={this.createReport}>{i18n('Create Report')}</Button>
              <p style={{ fontSize: '20px' }}>
                <span>
                  {i18n('You can create an error report and report the problem to us at: ')}
                </span>
                <br />
                <a href="#" onClick={this.goToSupport}>
                  {i18n('Plottr Support')}
                </a>
              </p>
            </div>
          ) : null}
          {this.state.viewError ? (
            <div className="error-boundary__view-error well">
              <h3>{i18n('Error: {error}', { error: this.error.message })}</h3>
              <div>{this.errorInfo.componentStack}</div>
            </div>
          ) : null}
        </div>
      )
    }

    return this.props.children
  }
}
