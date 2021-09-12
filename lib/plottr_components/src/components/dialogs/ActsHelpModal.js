import React from 'react'
import PropTypes from 'react-proptypes'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { t } from 'plottr_locales'
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
  },
}

const textStepsWrapper = {
  display: 'flex',
}

const steps = {
  display: 'list-item',
  fontSize: 18,
  width: '100%',
  listStyleType: 'decimal !important',
}

const column = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  paddingRight: 20,
}

const imageStyles = {
  height: '40vh',
  width: '60vw',
  alignSelf: 'center',
}

const ActsHelpModalConnector = (connector) => {
  const PlottrModal = UnconnectedPlottrModal(connector)

  function ActsHelpModal({ close, darkMode }) {
    return (
      <PlottrModal isOpen={true} onRequestClose={close} style={modalStyles}>
        <h3>{t('How to turn on Act Structure')}</h3>
        <hr />
        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={textStepsWrapper}>
            <ol style={column} start={1}>
              <li style={steps}>
                {t(`Navigate to the top right corner of the app, then click the person icon.`)}
              </li>
              <li style={steps}>{t(`Click on the 'Settings' from the dropdown.`)}</li>
            </ol>
            <ol style={column} start={3}>
              <li style={steps}>{t(`On the 'Settings' modal, click on the 'Beta' tab.`)}</li>
              <li style={steps}>
                {t(`Finally, toggle the switch to turn on/off the Act Structure.`)}
              </li>
            </ol>
          </div>
          <img src={`../icons/acts_guide_help${darkMode ? '_dark' : ''}.png`} style={imageStyles} />
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

  const { redux } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        darkMode: state.present.ui.darkMode,
      }
    })(ActsHelpModal)
  }

  throw new Error('Could not connect ActsHelpModal')
}

export default ActsHelpModalConnector
