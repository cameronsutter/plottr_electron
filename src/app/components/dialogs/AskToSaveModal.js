import React from 'react'
import { Form, FormGroup, Button, Modal, Col } from 'react-bootstrap'
import i18n from 'format-message'
import getTestIds from 'test-utils/getTestIds'

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
