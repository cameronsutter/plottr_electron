import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'react-proptypes'
import { isEqual } from 'lodash'

import { selectors } from 'pltr/v2'

import UnconnectedRichTextEditor from './RichTextEditor'
import RichTextViewer from './RichTextViewer'
import UnconnectedRCEBoundary from './RCEBoundary'
import { Spinner } from '../Spinner'
import { checkDependencies } from '../checkDependencies'

const RichTextConnector = (connector) => {
  const RCEBoundary = UnconnectedRCEBoundary(connector)
  const RichTextEditor = UnconnectedRichTextEditor(connector)

  const {
    platform: {
      storage: { imagePublicURL, isStorageURL },
      openExternal,
      log,
      createErrorReport,
      lockRCE,
      listenForRCELock,
      releaseRCELock,
    },
  } = connector
  checkDependencies({
    imagePublicURL,
    isStorageURL,
    openExternal,
    log,
    createErrorReport,
    lockRCE,
    listenForRCELock,
    releaseRCELock,
  })

  const defaultSelection = null

  const RichText = (props) => {
    const [lock, setLock] = useState(props.isCloudFile ? null : true)
    const [stealingLock, setStealingLock] = useState(false)
    const [focus, setFocus] = useState(null)

    let body = null
    const disabled = lock && lock.clientId && lock.clientId !== props.clientId

    const reset = () => {
      props.onChange(null, defaultSelection)
    }

    const stealLock = useCallback(() => {
      if (stealingLock) return

      setFocus(true)
      setStealingLock(true)
      lockRCE(props.fileId, props.id, props.clientId, lock, props.emailAddress)
        .then(() => {
          setStealingLock(false)
        })
        .catch((error) => {
          log.error(`Error stealing the lock for editor: ${props.id}`, error)
          setStealingLock(false)
        })
    }, [props.fileId, props.id, props.clientId, props.emailAddress, lock])

    const relinquishLock = useCallback(() => {
      if (releaseRCELock && lock?.clientId === props.clientId) {
        releaseRCELock(props.fileId, props.id, lock)
      }
    }, [props.fileId, props.id, props.clientId, lock])

    const onFocus = () => {
      setFocus(true)
      if (!lock || !lock.clientId) {
        stealLock()
      }
    }

    const onBlur = () => {
      setFocus(false)
      relinquishLock()
    }

    // Check for edit locks
    useEffect(() => {
      return listenForRCELock(props.fileId, props.id, props.clientId, (lockResult) => {
        if (!isEqual(lockResult, lock)) {
          setLock(lockResult)
          if (lockResult.clientId !== null && lockResult.clientId !== props.clientId) {
            setFocus(false)
          } else if ((focus || focus === null) && (!lockResult || !lockResult.clientId)) {
            stealLock()
          }
        }
      })
    }, [setLock, props.fileId, lock, props.id, props.clientId, stealLock, focus])

    useEffect(() => {
      return () => {
        if (releaseRCELock && lock?.clientId === props.clientId) {
          releaseRCELock(props.fileId, props.id)
        }
      }
    }, [lock, props.fileId, props.id])

    if (props.editable && !lock && !disabled) {
      return <Spinner />
    }

    if (props.editable && !disabled) {
      body = (
        <RichTextEditor
          id={props.id}
          onBlur={onBlur}
          onFocus={onFocus}
          className={props.className}
          onChange={props.onChange}
          autoFocus={props.autofocus}
          selection={props.selection}
          text={props.description}
          darkMode={props.darkMode}
        />
      )
    } else {
      // TODO: support live watching(?)
      body = (
        <RichTextViewer
          lock={lock}
          disabled={!props.editable}
          stealingLock={stealingLock}
          stealLock={stealLock}
          clientId={props.clientId}
          text={props.description}
          className={props.className}
          openExternal={openExternal}
          log={log}
          imagePublicURL={imagePublicURL}
          isStorageURL={isStorageURL}
        />
      )
    }

    return (
      <RCEBoundary
        createErrorReport={createErrorReport}
        openExternal={openExternal}
        resetChildren={reset}
      >
        {body}
      </RCEBoundary>
    )
  }

  RichText.propTypes = {
    id: PropTypes.string,
    clientId: PropTypes.string,
    fileId: PropTypes.string,
    emailAddress: PropTypes.string,
    description: PropTypes.any,
    selection: PropTypes.object,
    onChange: PropTypes.func,
    editable: PropTypes.bool,
    autofocus: PropTypes.bool,
    className: PropTypes.string,
    darkMode: PropTypes.bool.isRequired,
    isStorageURL: PropTypes.func.isRequired,
    imagePublicURL: PropTypes.func.isRequired,
    isCloudFile: PropTypes.bool,
  }

  const { redux } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      fileId: selectors.selectedFileIdSelector(state.present),
      clientId: selectors.clientIdSelector(state.present),
      emailAddress: selectors.emailAddressSelector(state.present),
      isCloudFile: selectors.isCloudFileSelector(state.present),
    }))(RichText)
  }

  throw new Error("Couldn't connect RichText")
}

export default RichTextConnector
