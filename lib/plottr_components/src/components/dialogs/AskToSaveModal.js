import React from 'react'
import PropTypes from 'react-proptypes'

import { t as i18n } from 'plottr_locales'

import Modal from '../Modal'
import Button from '../Button'
import getTestIds from '../getTestIds'

export const testIds = getTestIds()

export default function AskToSaveModal({ save, dontSave, cancel }) {
  return (
    <Modal show={true} onHide={cancel} dialogClassName="center-modal-vertically">
      <Modal.Header closeButton>{i18n('Save before closing?')}</Modal.Header>
      <Modal.Body>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button data-testid={testIds.ok} bsStyle="success" onClick={save}>
            {i18n('Save')}
          </Button>
          <Button data-testid={testIds.cancel} bsStyle="danger" onClick={dontSave}>
            {i18n('Exit Without Saving')}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

AskToSaveModal.propTypes = {
  save: PropTypes.func,
  dontSave: PropTypes.func,
  cancel: PropTypes.func,
}
