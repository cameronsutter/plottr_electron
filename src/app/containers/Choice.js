import React from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import cx from 'classnames'

import { selectors } from 'pltr/v2'
import { ChoiceView } from 'connected-components'

const nop = () => {}

const Choice = ({ darkMode }) => {
  return (
    <div id="dashboard__react__root">
      <div className={cx('dashboard__main', { darkmode: darkMode })}>
        <div className="dashboard__account" style={{ width: '100vw' }}>
          <ChoiceView goToAccount={nop} />
        </div>
      </div>
    </div>
  )
}

Choice.propTypes = {
  darkMode: PropTypes.bool,
}

export default connect((state) => ({ darkMode: selectors.isDarkModeSelector(state.present) }))(
  Choice
)
