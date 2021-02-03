import { ipcRenderer } from 'electron'
import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import log from 'electron-log'
import ErrorBoundary from '../app/containers/ErrorBoundary'
import DashboardBody from './components/navigation/DashboardBody'
import DashboardNavigation from './components/navigation/DashboardNavigation'
import DashboardHeader from './components/navigation/DashboardHeader'
// TODO: when you split out the dashboard styles into their own folder, you'll need this
// import 'style-loader!css-loader!sass-loader!./styles/dashboard.scss'

const darkModeStorageKey = 'darkMode'
let darkModeStorageValue = { isOn: false }
try {
  darkModeStorageValue = JSON.parse(localStorage.getItem(darkModeStorageKey))
} catch (error) {
  log.error('DA001', error)
}

export default function DashboardApp() {
  const [view, setView] = useState('files')
  const [darkMode, setDarkMode] = useState(
    (darkModeStorageValue && darkModeStorageValue.isOn) || false
  )

  useEffect(() => {
    ipcRenderer.on('set-dark-mode', (event, isOn) => {
      setDarkMode(isOn)
      localStorage.setItem(darkModeStorageKey, JSON.stringify({ isOn }))
    })

    return () => ipcRenderer.removeAllListeners('set-dark-mode')
  }, [])

  return (
    <ErrorBoundary>
      <DashboardHeader darkMode={darkMode} />
      <main className={cx({ darkmode: darkMode })}>
        <DashboardNavigation currentView={view} setView={setView} />
        <DashboardBody currentView={view} setView={setView} />
      </main>
    </ErrorBoundary>
  )
}
