import React from 'react'
import { is } from 'electron-util'


export default function DashboardHeader (props) {
  if (!is.macos) {
    // render the three buttons (minimize, maximize, close)
  }
  return <div className='dashboard__header'>Plottr</div>
}