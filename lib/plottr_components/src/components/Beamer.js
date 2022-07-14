import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { FaRegBell } from 'react-icons/fa'

import Button from './Button'
import { checkDependencies } from './checkDependencies'

const BeamerConnector = (connector) => {
  const {
    platform: { openExternal, isWindows },
  } = connector

  checkDependencies({ openExternal, isWindows })

  function Beamer({ inNavigation, user }) {
    const [isInitialized, setInitialized] = useState(false)

    const paymentId = user.payment_id
    const customerEmail = user.customer_email

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
    user: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => {
      return {
        user: selectors.userSettingsSelector(state.prenent),
      }
    })(Beamer)
  }

  throw new Error('Could not connect Beamer')
}

export default BeamerConnector
