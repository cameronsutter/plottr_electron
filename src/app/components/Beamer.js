import React, { useEffect } from 'react'
import { shell } from 'electron'
import { FaRegBell } from 'react-icons/fa'

function Beamer (props) {

  useEffect(() => {
    if (window.Beamer) {
      window.Beamer.update({callback: getBeamerAlerts, onclick: openBeamerLink})
      window.Beamer.init()
    }
  }, [])

  const getBeamerAlerts = (num) => {}

  const openBeamerLink = (url, newWindow) => {
    shell.openExternal(url)
    return false
  }

  if (!window.Beamer) return null

  return <ul className='nav navbar-nav navbar-right' style={{marginRight: '0'}}>
    <li>
      <a id='beamer-bell' href='#'>
        <FaRegBell/>
      </a>
    </li>
  </ul>
}

export default Beamer