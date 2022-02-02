import React from 'react'
import PropTypes from 'react-proptypes'
import { Modal, Button, Form } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'

export default function MessageModal(props) {
  const { message, onAcknowledge, disableAcknowledge, buttonText } = props
  return (
    <Modal show={true} dialogClassName="center-modal-vertically">
      <Modal.Body>
        <h6>{message}</h6>
        {props.children}
      </Modal.Body>
      <Modal.Footer>
        <Form
          onSubmit={(event) => {
            if (disableAcknowledge) return
            onAcknowledge(event)
          }}
          onKeyDown={(event) => {
            if (event.which == 27 && !disableAcknowledge) {
              onAcknowledge(event)
            }
          }}
        >
          <Button onClick={onAcknowledge} disabled={disableAcknowledge}>
            {i18n(buttonText) || i18n('Ok')}
          </Button>
        </Form>
      </Modal.Footer>
    </Modal>
  )
}

MessageModal.propTypes = {
  message: PropTypes.string,
  onAcknowledge: PropTypes.func,
  children: PropTypes.any,
  disableAcknowledge: PropTypes.bool,
  buttonText: PropTypes.string,
}
