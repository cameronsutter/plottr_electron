import React from 'react'
import { ipcRenderer } from 'electron'
import { render } from 'react-dom'
import ReportView from 'ReportView'

const root = document.getElementById('report__react__root')

ipcRenderer.on('which-page', (sender, page) => {
  render(
    <ReportView page={page} />,
    root
  )
})
