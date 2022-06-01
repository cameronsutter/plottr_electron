import React from 'react'
import { PropTypes } from 'prop-types'

import { t } from 'plottr_locales'

import { PlottrModal, ModalBody, ModalFooter, Form, Button } from 'connected-components'

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

const UploadOfflineFile = ({ closeDialog, filePath, onUploadFile, onCancel }) => {
  return (
    <PlottrModal isOpen onRequestClose={closeDialog} style={modalStyles}>
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
        <Form onSubmit={onUploadFile}>
          <Button onClick={onUploadFile} type="submit" bsStyle="primary">
            {t('Upload')}
          </Button>
          <Button onClick={onCancel}>{t('Cancel')}</Button>
        </Form>
      </ModalFooter>
    </PlottrModal>
  )
}

UploadOfflineFile.propTypes = {
  filePath: PropTypes.string.isRequired,
  closeDialog: PropTypes.func.isRequired,
  onUploadFile: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default UploadOfflineFile
