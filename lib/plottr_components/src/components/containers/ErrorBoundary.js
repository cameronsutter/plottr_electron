import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { IoIosAlert } from 'react-icons/io'

import { t as i18n } from 'plottr_locales'

import setupRollbar from '../../utils/rollbar'
import { checkDependencies } from '../checkDependencies'
import Button from '../Button'
import { makeErrorWindow } from '../errorWindow'

const ErrorBoundaryConnector = (connector) => {
  const {
    platform: {
      log,
      createErrorReport,
      openExternal,
      appVersion,
      user,
      node: { env },
      rollbar: { rollbarAccessToken, platform },
    },
  } = connector
  checkDependencies({
    log,
    createErrorReport,
    openExternal,
    appVersion,
    user,
    env,
    rollbarAccessToken,
    platform,
  })

  class ErrorBoundary extends Component {
    state = {
      hasError: false,
      viewError: false,
      count: 0,
      rollbar: null,
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, viewError: false }
    }

    componentDidMount() {
      setupRollbar('ErrorBoundary', appVersion, user, env, rollbarAccessToken, platform)
        .then((rollbar) => {
          this.setState({ rollbar })
        })
        .catch((error) => {
          log.error('Could not construct rollbar instance.', error)
        })
    }

    withErrorWindow = makeErrorWindow(' logging to Rollbar ')

    componentDidCatch(error, errorInfo) {
      this.error = error
      this.errorInfo = errorInfo
      log.error(error, errorInfo)
      if (this.state.rollbar) {
        this.withErrorWindow(() => {
          this.state.rollbar.error(error, errorInfo)
        })
      }
    }

    createReport = () => {
      createErrorReport(this.error, this.errorInfo, this.props.proInfo, this.props.trialInfo)
    }

    goToSupport = () => {
      openExternal('https://plottr.com/support/')
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="error-boundary">
            <div className="text-center">
              <IoIosAlert />
              <h1>{i18n('Something went wrong,')}</h1>
              <h2>{i18n("but don't worry!")}</h2>
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
                <h3 className="error-boundary-title">
                  {i18n('Error: {error}', { error: this.error.message })}
                </h3>
                <div className={cx('error-boundary-body', { darkmode: this.props.darkMode })}>
                  {this.errorInfo.componentStack}
                </div>
              </div>
            ) : null}
          </div>
        )
      }

      return this.props.children
    }
  }

  ErrorBoundary.propTypes = {
    children: PropTypes.node,
    darkMode: PropTypes.bool,
    proInfo: PropTypes.object,
    trialInfo: PropTypes.object,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  checkDependencies({ redux })

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        darkMode: state.present.ui.darkMode,
        proInfo: selectors.proInfoSelector(state.present),
        trialInfo: selectors.trialInfoSelector(state.present),
      }
    })(ErrorBoundary)
  }

  throw new Error('Could not connect ErrorBoundary')
}

export default ErrorBoundaryConnector
