import React from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Navbar, Nav, NavItem, Button } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import { ipcRenderer } from 'electron'
import { Beamer, BookChooser, OverlayTrigger } from 'connected-components'
import SETTINGS from '../../common/utils/settings'
import { actions } from 'pltr/v2'
import { FaKey } from 'react-icons/fa'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { selectors } from 'pltr/v2'
import cx from 'classnames'

const trialMode = SETTINGS.get('trialMode')
const isDev = process.env.NODE_ENV == 'development'

const Navigation = ({ isDarkMode, currentView, changeCurrentView }) => {
  const handleSelect = (selectedKey) => {
    changeCurrentView(selectedKey)
  }

  const renderTrialLinks = () => {
    if (!trialMode || isDev) return null

    return (
      <Navbar.Form pullRight style={{ marginRight: '15px' }}>
        <Button bsStyle="link" onClick={() => ipcRenderer.send('open-buy-window')}>
          <FaKey /> {i18n('Get a License')}
        </Button>
      </Navbar.Form>
    )
  }

  const Menu = () => {
    return (
      <div className={cx('project-nav__menu-popover', { darkmode: isDarkMode })}>
        <Button>Account</Button>
        <Button>Settings</Button>
        <Button>License</Button>
        <Button>Backups</Button>
        <Button>Help</Button>
      </div>
    )
  }

  return (
    <Navbar className="project-nav" fluid inverse={isDarkMode}>
      <Nav onSelect={handleSelect} activeKey={currentView} bsStyle="pills">
        <BookChooser />
        <NavItem eventKey="project">{i18n('Project')}</NavItem>
        <NavItem eventKey="timeline">{i18n('Timeline')}</NavItem>
        <NavItem eventKey="outline">{i18n('Outline')}</NavItem>
        <NavItem eventKey="notes">{i18n('Notes')}</NavItem>
        <NavItem eventKey="characters">{i18n('Characters')}</NavItem>
        <NavItem eventKey="places">{i18n('Places')}</NavItem>
        <NavItem eventKey="tags">{i18n('Tags')}</NavItem>
        {isDev ? (
          <NavItem eventKey="analyzer">
            Analyzer<sup>(DEV)</sup>
          </NavItem>
        ) : null}
      </Nav>
      <Beamer inNavigation />
      {renderTrialLinks()}
      <Nav pullRight className="project-nav__options">
        <OverlayTrigger
          containerPadding={20}
          trigger="click"
          rootClose
          placement="bottom"
          overlay={Menu}
        >
          <Button>
            <BsThreeDotsVertical />
          </Button>
        </OverlayTrigger>
      </Nav>
    </Navbar>
  )
}

Navigation.propTypes = {
  currentView: PropTypes.string.isRequired,
  isDarkMode: PropTypes.bool,
  changeCurrentView: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  return {
    currentView: selectors.currentViewSelector(state.present),
    isDarkMode: selectors.isDarkModeSelector(state.present),
  }
}

export default connect(mapStateToProps, { changeCurrentView: actions.ui.changeCurrentView })(
  Navigation
)
