import 'babel-core/polyfill'
import React from 'react'
import { render } from 'react-dom'
import ReportView from 'ReportView'

const root = document.getElementById('report__react__root')

render(
  <ReportView />,
  root
)
