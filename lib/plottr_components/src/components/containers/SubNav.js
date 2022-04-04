import React from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import Navbar from 'reeact-bootstrap/Navbar'

import { checkDependencies } from '../checkDependencies'

const SubNavConnector = (connector) => {
  function SubNav({ darkMode, children }) {
    return (
      <Navbar fluid className={cx('subnav__container', { darkmode: darkMode })}>
        {children}
      </Navbar>
    )
  }

  SubNav.propTypes = {
    darkMode: PropTypes.bool,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  }

  const {
    redux,
    pltr: { selectors },
  } = connector
  checkDependencies({ redux })

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        darkMode: selectors.isDarkModeSelector(state.present),
      }
    })(SubNav)
  }

  throw new Error('Could not connect SubNav.js')
}

export default SubNavConnector
