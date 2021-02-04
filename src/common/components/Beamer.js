import React, { useEffect, useState } from 'react'
import { shell } from 'electron'
import cx from 'classnames'
import { FaRegBell } from 'react-icons/fa'
import USER from '../utils/user_info'
import { is } from 'electron-util'

function Beamer({ inNavigation }) {
  const [isInitialized, setInitialized] = useState(false)

  const initBeamer = () => {
    if (is.development) return true
    if (!window.Beamer) return false

    const options = { callback: getBeamerAlerts, onclick: openBeamerLink }
    if (USER.get('payment_id')) {
      options.user_email = USER.get('customer_email')
      options.user_id = USER.get('payment_id')
    }
    window.Beamer.update(options)
    window.Beamer.init()
    setInitialized(true)
    return true
  }

  useEffect(() => {
    if (!initBeamer()) {
      setTimeout(() => initBeamer(), 5000)
    }
  }, [])

  const getBeamerAlerts = (num) => {}

  const openBeamerLink = (url, newWindow) => {
    shell.openExternal(url)
    return false
  }

  if (!isInitialized) return null

  const bell = (
    <a id="beamer-bell" href="#">
      <FaRegBell />
    </a>
  )

  if (inNavigation) {
    return (
      <ul className="nav navbar-nav navbar-right" style={{ marginRight: '2px' }}>
        <li>{bell}</li>
      </ul>
    )
  } else {
    return <div className={cx('beamer-wrapper', { win32: is.windows })}>{bell}</div>
  }
}

export default Beamer
