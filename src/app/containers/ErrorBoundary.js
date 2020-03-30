import React, { Component } from 'react'
import setupRollbar from '../../common/utils/rollbar'
import log from 'electron-log'
import i18n from 'format-message'
const rollbar = setupRollbar('ErrorBoundary')

export default class ErrorBoundary extends Component {
  state = {hasError: false}

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV !== 'development') {
      log.error(error, errorInfo)
      rollbar.error(error, errorInfo)
    }
  }

  render () {
    if (this.state.hasError) {
      return <div className='text-center'>
        <h1>{i18n('Something went wrong.')}</h1>
        <p style={{fontSize: '20px'}}>{i18n('Try that again, but if it keeps happening, use the help menu to create an error report and report the problem to me.')}</p>
      </div>
    }

    return this.props.children
  }
}
