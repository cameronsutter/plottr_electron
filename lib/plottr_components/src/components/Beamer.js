import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { FaRegBell } from 'react-icons/fa'

const BeamerConnector = (connector) => {
  const {
    platform: { openExternal, isWindows, isDevelopment, user },
  } = connector

  const paymentId = user.get('payment_id')
  const customerEmail = user.get('customer_email')

  function Beamer({ inNavigation }) {
    const [isInitialized, setInitialized] = useState(false)

    const getBeamerAlerts = (num) => {}

    const openBeamerLink = (url, newWindow) => {
      openExternal(url)
      return false
    }

    const initBeamer = () => {
      // if (isDevelopment) return true
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
    inNavigation: PropTypes.bool,
  }

  return Beamer
}

export default BeamerConnector
