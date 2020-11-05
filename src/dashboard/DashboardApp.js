import React, { Component, useState } from 'react'
// import { ipcRenderer, remote } from 'electron'
// const win = remote.getCurrentWindow()
import ErrorBoundary from '../app/containers/ErrorBoundary'
import DashboardBody from './components/navigation/DashboardBody'
import DashboardNavigation from './components/navigation/DashboardNavigation'
import DashboardHeader from './components/navigation/DashboardHeader'
// import 'style-loader!css-loader!sass-loader!./styles/dashboard.scss'

// win.close()

export default function DashboardApp () {
  const [view, setView] = useState('home')

  return <ErrorBoundary>
    <DashboardHeader/>
    <main>
      <DashboardNavigation currentView={view} setView={setView}/>
      <DashboardBody currentView={view} setView={setView}/>
    </main>
  </ErrorBoundary>
}
