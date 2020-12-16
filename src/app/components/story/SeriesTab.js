import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import EditSeries from './EditSeries'
import BookList from './BookList'
import i18n from 'format-message'
import cx from 'classnames'
import ErrorBoundary from '../../containers/ErrorBoundary'
import { Nav, Navbar, NavItem, Button } from 'react-bootstrap'
import FileLocation from './FileLocation'
import { ipcRenderer } from 'electron'

function SeriesTab ({ ui }) {

  const openDashboard = () => {
    ipcRenderer.send('pls-open-dashboard')
  }

  const renderSubNav = () => {
    return <Navbar className={cx('subnav__container', {darkmode: ui.darkMode})}>
      <Nav bsStyle='pills'>
        <NavItem>
          <Button bsSize='small' onClick={openDashboard}>{i18n('Open Dashboard')}</Button>
        </NavItem>
        <FileLocation />
      </Nav>
    </Navbar>
  }

  return <ErrorBoundary>
    <div className='series__container container-with-sub-nav'>
      { renderSubNav() }
      <EditSeries />
      <BookList />
    </div>
  </ErrorBoundary>
}

SeriesTab.propTypes = {
  ui: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    ui: state.present.ui,
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SeriesTab)
