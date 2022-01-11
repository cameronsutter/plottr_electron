import React from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import cx from 'classnames'

import { selectors } from 'pltr/v2'
import { ExpiredView } from 'connected-components'

const Expired = ({ darkMode }) => {
  return (
    <div id="dashboard__react__root">
      <div className={cx('dashboard__main', { darkmode: darkMode })}>
        <div className="dashboard__account" style={{ width: '100vw' }}>
          <ExpiredView />
        </div>
      </div>
    </div>
  )
}

Expired.propTypes = {
  darkMode: PropTypes.bool,
}

export default connect((state) => ({ darkMode: selectors.isDarkModeSelector(state.present) }))(
  Expired
)
