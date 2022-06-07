import React, { useState, useEffect } from 'react'
import { PropTypes } from 'prop-types'

import { t } from 'plottr_locales'

import MainIntegrationContext from '../../mainIntegrationContext'
import {
  Spinner,
  PlottrModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  Button,
  FunSpinner,
} from 'connected-components'

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

const UploadFile = ({ filePath, onUploadFile, onCancel, busy, basename }) => {
  const [fileBasename, setFileBasename] = useState(null)

  useEffect(() => {
    if (fileBasename || !basename) return

    basename(filePath).then(setFileBasename)
  }, [filePath, basename, setFileBasename, fileBasename])

  if (!fileBasename) return <FunSpinner />

  return (
    <PlottrModal isOpen style={modalStyles}>
      <ModalHeader>{t('Upload to Plottr Pro?')}</ModalHeader>
      <ModalBody>
        <h6>
          {t('To use "{ thing }" in Plottr Pro, you need to upload it first.', {
            thing: fileBasename,
          })}
        </h6>
        <h6>
          {t('({ thing }).', {
            thing: filePath,
          })}
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

UploadFile.propTypes = {
  filePath: PropTypes.string.isRequired,
  onUploadFile: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  busy: PropTypes.bool,
  basename: PropTypes.func.isRequired,
}

const UploadOfflineFile = ({ filePath, onUploadFile, onCancel, busy }) => {
  return (
    <MainIntegrationContext.Consumer>
      {({ basename }) => {
        return (
          <UploadFile
            filePath={filePath}
            onUploadFile={onUploadFile}
            onCancel={onCancel}
            busy={busy}
            basename={basename}
          />
        )
      }}
    </MainIntegrationContext.Consumer>
  )
}

UploadOfflineFile.propTypes = {
  filePath: PropTypes.string.isRequired,
  onUploadFile: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  busy: PropTypes.bool,
}

export default UploadOfflineFile