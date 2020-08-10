import React, { useEffect } from 'react'
import { shell } from 'electron'
import { FaRegBell } from 'react-icons/fa'
import USER from '../../common/utils/user_info'

function Beamer (props) {

  useEffect(() => {
    if (window.Beamer) {
      const options = {callback: getBeamerAlerts, onclick: openBeamerLink}
      if (USER.get('payment_id')) {
        options.user_email = USER.get('customer_email')
        options.user_id = USER.get('payment_id')
      }
      window.Beamer.update(options)
      window.Beamer.init()
    }
  }, [])

  const getBeamerAlerts = (num) => {}

  const openBeamerLink = (url, newWindow) => {
    shell.openExternal(url)
    return false
  }

  if (!window.Beamer) return null

  return <ul className='nav navbar-nav navbar-right' style={{marginRight: '2px'}}>
    <li>
      <a id='beamer-bell' href='#'>
        <FaRegBell/>
      </a>
    </li>
  </ul>
}

export default Beamer