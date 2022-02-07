import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'

const AdViewConnector = (connector) => {
  const {
    platform: { openExternal },
  } = connector
  checkDependencies({ openExternal })

  const AdView = (props) => {
    //if this changes, you have to change the animation length in dashboard/expired.scss ~ line 70
    const [timesUp, setTimesUp] = useState(false)
    const [countdown, setCountdown] = useState(10)

    const decrementCountdown = function () {
      let val = countdown
      let timesUp = --val === 0
      if (timesUp) {
        props.extendTrial()
      }
      setCountdown(val)
      setTimesUp(timesUp)
    }

    useEffect(() => {
      const timeout = setTimeout(decrementCountdown, 1000)

      return () => {
        clearTimeout(timeout)
      }
    }, [countdown])

    const handleAdClick = () => {
      openExternal('https://www.booksweeps.com/')
    }

    const Ad = () => {
      return (
        <div className="ad__wrapper" onClick={handleAdClick}>
          <img
            width="40%"
            src="https://www.booksweeps.com/wp-content/uploads/2019/10/BookSweeps-Logo-6-6.png"
          />
          <p>THE SMART &amp; EASY WAY TO BUILD AN AUDIENCE FOR YOUR BOOKS</p>
          <img
            width="40%"
            src="https://www.booksweeps.com/wp-content/uploads/2019/10/BookSweeps-effect-Illustration-V5.png"
          />
        </div>
      )
    }

    const renderCountdown = () => {
      if (timesUp) return null

      return (
        <div className="ad__countdown">
          <div className="ad__countdown-number">{countdown}</div>
          <svg>
            <circle r="18" cx="20" cy="20"></circle>
          </svg>
        </div>
      )
    }

    return (
      <div className="ad-view">
        {renderCountdown()}
        <h1>{i18n('You can have 5 more days to try Plottr')} 🎉</h1>
        <hr className="ad__hr" />
        <Ad />
      </div>
    )
  }

  AdView.propTypes = {
    extendTrial: PropTypes.func,
  }

  return AdView
}

export default AdViewConnector