import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { Button } from 'react-bootstrap'
import { FaRegBell } from 'react-icons/fa'

import { checkDependencies } from './checkDependencies'

const BeamerConnector = (connector) => {
  const {
    platform: { openExternal, isWindows, user },
  } = connector

  checkDependencies({ openExternal, isWindows, user })

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
      <Button bsSize="small" className="project-nav__beamer-button" id="beamer-bell" href="#">
        <FaRegBell />
      </Button>
    )

    if (inNavigation) {
      return bell
    } else {
      return <div className={cx('beamer-wrapper', { win32: isWindows() })}>{bell}</div>
    }
  }

  Beamer.propTypes = {
    inNavigation: PropTypes.bool,
  }

  return Beamer
}

export default BeamerConnector
