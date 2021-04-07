import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { FaRegBell } from 'react-icons/fa'

function Beamer({
  inNavigation,
  isWindows,
  paymentId,
  customerEmail,
  openExternal,
  isDevelopment,
}) {
  const [isInitialized, setInitialized] = useState(false)

  const initBeamer = () => {
    if (isDevelopment) return true
    if (!window.Beamer) return false

    const options = { callback: getBeamerAlerts, onclick: openBeamerLink }
    if (paymentId) {
      options.user_email = customerEmail
      options.user_id = paymentId
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
    openExternal(url)
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
    return <div className={cx('beamer-wrapper', { win32: isWindows })}>{bell}</div>
  }
}

Beamer.propTypes = {
  inNavigation: PropTypes.bool.isRequired,
  isWindows: PropTypes.bool.isRequired,
  paymentId: PropTypes.string.isRequired,
  customerEmail: PropTypes.string.isRequired,
  openExternal: PropTypes.func.isRequired,
  isDevelopment: PropTypes.bool,
}

export default Beamer
