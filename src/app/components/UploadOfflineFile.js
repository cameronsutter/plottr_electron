import React from 'react'
import { PropTypes } from 'prop-types'

import { t } from 'plottr_locales'

import { Spinner, PlottrModal, ModalBody, ModalFooter, Form, Button } from 'connected-components'

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
  },
}

const preventDefault = (event) => {
  event.preventDefault()
}

const UploadOfflineFile = ({ filePath, onUploadFile, onCancel, busy }) => {
  return (
    <PlottrModal isOpen style={modalStyles}>
      <ModalBody>
        <h6>
          {t(
            'To use "{ thing }" in Plottr Pro, you need to upload it first.  Would you like to upload it?',
            {
              thing: filePath,
            }
          )}
        </h6>
      </ModalBody>
      <ModalFooter>
        <Form onSubmit={preventDefault}>
          <Button onClick={onUploadFile} disabled={busy} type="submit" bsStyle="primary">
            {busy ? (
              <>
                <Spinner /> {t('Uploading')}
              </>
            ) : (
              t('Upload')
            )}
          </Button>
          <Button onClick={onCancel} disabled={busy}>
            {t('Cancel')}
          </Button>
        </Form>
      </ModalFooter>
    </PlottrModal>
  )
}

UploadOfflineFile.propTypes = {
  filePath: PropTypes.string.isRequired,
  onUploadFile: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  busy: PropTypes.bool,
}

export default UploadOfflineFile
