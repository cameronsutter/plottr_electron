import React from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { Navbar } from 'react-bootstrap'

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

  const { redux } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        darkMode: state.present.ui.darkMode,
      }
    })(SubNav)
  }

  throw new Error('Could not connect SubNav.js')
}

export default SubNavConnector
