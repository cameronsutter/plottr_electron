import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Navbar, Nav, NavItem, Button } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import { ipcRenderer } from 'electron'
import { Beamer, BookChooser } from 'connected-components'
import SETTINGS from '../../common/utils/settings'
import { actions } from 'pltr/v2'
import { FaKey } from 'react-icons/fa'

const trialMode = SETTINGS.get('trialMode')
const isDev = process.env.NODE_ENV == 'development'

class Navigation extends Component {
  handleSelect = (selectedKey) => {
    this.props.actions.changeCurrentView(selectedKey)
  }

  renderTrialLinks() {
    if (!trialMode || isDev) return null

    return (
      <Navbar.Form pullRight style={{ marginRight: '15px' }}>
        <Button bsStyle="link" onClick={() => ipcRenderer.send('open-buy-window')}>
          <FaKey /> {i18n('Get a License')}
        </Button>
      </Navbar.Form>
    )
  }

  render() {
    const { ui } = this.props
    return (
      <Navbar className="project-nav" fluid inverse={ui.darkMode}>
        <Nav onSelect={this.handleSelect} activeKey={ui.currentView} bsStyle="pills">
          <BookChooser />
          <NavItem eventKey="project">{i18n('Project')}</NavItem>
          <NavItem eventKey="timeline">{i18n('Timeline')}</NavItem>
          <NavItem eventKey="outline">{i18n('Outline')}</NavItem>
          <NavItem eventKey="notes">{i18n('Notes')}</NavItem>
          <NavItem eventKey="characters">{i18n('Characters')}</NavItem>
          <NavItem eventKey="places">{i18n('Places')}</NavItem>
          <NavItem eventKey="tags">{i18n('Tags')}</NavItem>
        </Nav>
        <Beamer inNavigation />
        {this.renderTrialLinks()}
      </Navbar>
    )
  }
}

Navigation.propTypes = {
  ui: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {
    ui: state.present.ui,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions.ui, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigation)
