import { ipcRenderer } from 'electron'
import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { DashboardErrorBoundary, DashboardBody, DashboardNavigation } from 'connected-components'
import DashboardHeader from './components/navigation/DashboardHeader'
// TODO: when you split out the dashboard styles into their own folder, you'll need this
// import 'style-loader!css-loader!sass-loader!./styles/dashboard.scss'

export default function DashboardApp() {
  const [view, setView] = useState('files')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    ipcRenderer.on('set-dark-mode', (event, isOn) => {
      setDarkMode(isOn)
    })

    return () => ipcRenderer.removeAllListeners('set-dark-mode')
  }, [])

  return (
    <DashboardErrorBoundary darkMode={darkMode}>
      <DashboardHeader darkMode={darkMode} />
      <main className={cx({ darkmode: darkMode })}>
        <DashboardNavigation currentView={view} setView={setView} />
        <DashboardBody currentView={view} setView={setView} darkMode={darkMode} />
      </main>
    </DashboardErrorBoundary>
  )
}
