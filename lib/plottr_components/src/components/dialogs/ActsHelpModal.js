import React from 'react'
import PropTypes from 'react-proptypes'
import { Button, ButtonToolbar } from 'react-bootstrap'
import { t } from 'plottr_locales'
import UnconnectedPlottrModal from '../PlottrModal'

const ActsHelpModalConnector = (connector) => {
  const PlottrModal = UnconnectedPlottrModal(connector)

  function ActsHelpModal({ close }) {
    return (
      <PlottrModal show={true} onRequestClose={close}>
        <div className="export-dialog__wrapper">
          <div className="export-dialog__header">
            <div className="export-dialog__type-chooser">
              <h3>{t('How to turn on Act Structure')}</h3>
            </div>
            <hr />
          </div>
          <div className="export-dialog__body">
            <img src="../icons/acts_guide_help.png" height="300" />
          </div>
          <div className="export-dialog__footer">
            <hr />
            <div>
              <ButtonToolbar>
                <Button onClick={close}>{t('Close')}</Button>
              </ButtonToolbar>
            </div>
          </div>
        </div>
      </PlottrModal>
    )
  }

  ActsHelpModal.propTypes = {
    close: PropTypes.func,
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
