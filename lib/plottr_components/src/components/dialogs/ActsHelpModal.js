import React from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import ButtonToolbar from '../ButtonToolbar'
import Button from '../Button'
import UnconnectedPlottrModal from '../PlottrModal'

const modalStyles = {
  overlay: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '75%',
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    right: 'auto',
    minHeight: 500,
    maxHeight: 'calc(100vh - 80px)',
    borderRadius: 20,
  },
}

const ActsHelpModalConnector = (connector) => {
  const PlottrModal = UnconnectedPlottrModal(connector)

  function ActsHelpModal({ close, darkMode }) {
    return (
      <PlottrModal isOpen={true} onRequestClose={close} style={modalStyles}>
        <h3>{t('How to turn on Act Structure')}</h3>
        <hr />
        <div className="acts-help-wrapper">
          <div className="text-steps-wrapper">
            <ol start={1}>
              <li>{t(`On the top right corner of the app, click the "Dashboard" button.`)}</li>
              <li>{t(`From the "Dashboard", click "Settings" from the side menu.`)}</li>
            </ol>
            <ol start={3}>
              <li>{t(`On the "Settings" modal, click on the "Beta" tab.`)}</li>
              <li>{t(`Finally, toggle the switch to turn on/off Act Structure.`)}</li>
            </ol>
          </div>
          <img src={`../icons/acts_guide_help_v2${darkMode ? '_dark' : ''}.png`} />
        </div>
        <div>
          <hr />
          <ButtonToolbar>
            <Button onClick={close}>{t('Close')}</Button>
          </ButtonToolbar>
        </div>
      </PlottrModal>
    )
  }

  ActsHelpModal.propTypes = {
    close: PropTypes.func,
    darkMode: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        darkMode: selectors.isDarkModeSelector(state.present),
      }
    })(ActsHelpModal)
  }

  throw new Error('Could not connect ActsHelpModal')
}

export default ActsHelpModalConnector
