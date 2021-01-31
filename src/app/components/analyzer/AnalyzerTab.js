import React, { Component } from 'react'
import ErrorBoundary from '../../containers/ErrorBoundary'
import Analyzer from './Analyzer'

export default () => {
  return (
    <ErrorBoundary>
      <Analyzer />
    </ErrorBoundary>
  )
}
