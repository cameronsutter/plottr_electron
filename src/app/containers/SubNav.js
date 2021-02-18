import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import cx from 'classnames'
import { Navbar } from 'react-bootstrap'

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

function mapStateToProps(state) {
  return {
    darkMode: state.present.ui.darkMode,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(SubNav)
