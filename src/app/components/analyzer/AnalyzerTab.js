import React from 'react'
import { ErrorBoundary } from 'connected-components'
import Analyzer from './Analyzer'

export default function AnalyzerTab() {
  return (
    <ErrorBoundary>
      <Analyzer />
    </ErrorBoundary>
  )
}
