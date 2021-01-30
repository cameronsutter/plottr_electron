import React from 'react'
import ErrorBoundary from '../../containers/ErrorBoundary'
import Analyzer from './Analyzer'

export default function AnalyzerTab() {
  return (
    <ErrorBoundary>
      <Analyzer />
    </ErrorBoundary>
  )
}
