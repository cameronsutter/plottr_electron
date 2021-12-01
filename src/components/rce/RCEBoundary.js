import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import setupRollbar from '../../utils/rollbar'
import { t as i18n } from 'plottr_locales'
import { Button } from 'react-bootstrap'
import { IoIosAlert } from 'react-icons/io'

import { checkDependencies } from '../checkDependencies'

const RCEBoundaryConnector = (connector) => {
  const {
    platform: { appVersion, log, user },
  } = connector
  checkDependencies({ appVersion, log, user })

  const selectionErrorMessages = [
    'Cannot resolve a DOM point from Slate point',
    'Cannot resolve a Slate point from DOM point',
    'Cannot find a descendant at path',
    'Cannot get the start point in the node at path',
    'Cannot lift node at a path',
  ]

  class RCEBoundary extends Component {
    state = {
      hasError: false,
      viewError: false,
      error: null,
      count: 0,
      autoResetCount: 0,
      rollbar: setupRollbar(
        'ErrorBoundary',
        appVersion,
        user,
        (process.env.NEXT_PUBLIC_NODE_ENV || process.env.NEXT_PUBLIC_NODE_ENV) === 'development'
          ? 'development'
          : 'production',
        process.env.NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN || process.env.ROLLBAR_ACCESS_TOKEN || '',
        process.platform
      ),
    }

    static propTypes = {
      children: PropTypes.node,
      resetChildren: PropTypes.func,
      createErrorReport: PropTypes.func.isRequired,
      openExternal: PropTypes.func.isRequired,
    }

    static getDerivedStateFromError(error) {
      return { error, viewError: false }
    }

    componentDidCatch(error, errorInfo) {
      if (selectionErrorMessages.some((m) => error.message.includes(m))) {
        log.warn('Reseting selection on RCE after an error.', error, errorInfo)
        return this.props.resetChildren()
      }
      this.error = error
      this.errorInfo = errorInfo
      this.state.rollbar.error(error, errorInfo)
    }

    componentDidUpdate() {
      const { error, autoResetCount } = this.state
      if (autoResetCount > 0) return

      // attempt an auto reset
      if (error && selectionErrorMessages.some((m) => error.message.includes(m))) {
        this.setState({ error: null, count: 0, autoResetCount: autoResetCount + 1 })
      }
    }

    tryAgain = () => {
      this.setState({ error: null, count: this.state.count + 1, autoResetCount: 0 })
    }

    createReport = () => {
      this.props.createErrorReport(this.error, this.errorInfo)
    }

    goToSupport = () => {
      this.props.openExternal('https://plottr.com/support/')
    }

    render() {
      if (this.state.error) {
        return (
          <div className="error-boundary rce">
            <div className="text-center">
              <h4>
                <IoIosAlert />
                {i18n('Text Error')}
              </h4>
            </div>
            <div className="error-boundary__options">
              <Button bsStyle="warning" onClick={this.tryAgain}>
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

  return RCEBoundary
}

export default RCEBoundaryConnector
