import React from 'react'
import PropTypes from 'react-proptypes'

import { t as i18n } from 'plottr_locales'

import Form from '../Form'
import Modal from '../Modal'
import Button from '../Button'

export default function ErrorModal(props) {
  const { message, onAcknowledge } = props
  return (
    <Modal show={true} dialogClassName="center-modal-vertically">
      <Modal.Body>
        <h6>{message}</h6>
      </Modal.Body>
      <Modal.Footer>
        <Form
          onSubmit={onAcknowledge}
          onKeyDown={(event) => {
            if (event.which == 27) onAcknowledge(event)
          }}
        >
          <Button onClick={onAcknowledge}>{i18n('Ok')}</Button>
        </Form>
      </Modal.Footer>
    </Modal>
  )
}

ErrorModal.propTypes = {
  name: PropTypes.string,
  message: PropTypes.string,
  onAcknowledge: PropTypes.func,
}
