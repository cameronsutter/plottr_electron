import React, { useState, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { isEqual } from 'lodash'
import { v4 as uuidv4 } from 'uuid'

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
      storage: { resolveToPublicUrl, isStorageURL },
      openExternal,
      log,
      createErrorReport,
      lockRCE,
      listenForRCELock,
      releaseRCELock,
    },
  } = connector
  checkDependencies({
    resolveToPublicUrl,
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
    const key = useRef(uuidv4())
    const [lock, setLock] = useState(props.isCloudFile ? null : true)
    const [stealingLock, setStealingLock] = useState(false)
    const [focus, setFocus] = useState(null)

    let body = null
    const disabled = lock && lock.clientId && lock.clientId !== props.clientId
    const showEditor = props.editable

    const reset = useCallback(() => {
      props.onChange(null, defaultSelection)
    }, [props.onChange])

    const onCloud = props.isLoggedIn && props.isCloudFile

    const stealLock = useCallback(() => {
      if (
        !showEditor ||
        !props.id ||
        !onCloud ||
        stealingLock ||
        props.isOffline ||
        props.isResuming
      )
        return

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
    }, [
      props.fileId,
      props.id,
      props.clientId,
      props.emailAddress,
      lock,
      props.isOffline,
      props.isResuming,
    ])

    const relinquishLock = useCallback(() => {
      if (
        !showEditor ||
        (props.id && onCloud && releaseRCELock && lock?.clientId === props.clientId)
      ) {
        releaseRCELock(props.fileId, props.id, lock)
      }
    }, [props.fileId, props.id, props.clientId, lock])

    const onFocus = useCallback(() => {
      setFocus(true)
      if (!lock || !lock.clientId) {
        stealLock()
      }
    }, [setFocus, lock, stealLock])

    const onBlur = useCallback(() => {
      setFocus(false)
      relinquishLock()
    }, [setFocus, relinquishLock])

    // Check for edit locks
    useEffect(() => {
      if (!showEditor || !onCloud || props.isOffline || props.isResuming || !props.id)
        return () => {}

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
    }, [
      setLock,
      props.fileId,
      lock,
      props.id,
      props.clientId,
      stealLock,
      focus,
      props.isOffline,
      props.isResuming,
      showEditor,
    ])

    useEffect(() => {
      if (!showEditor || props.isOffline || props.isResuming || !props.id) {
        return () => {}
      }

      return () => {
        if (releaseRCELock && lock?.clientId === props.clientId) {
          releaseRCELock(props.fileId, props.id)
        }
      }
    }, [lock, props.fileId, props.id, props.isOffline, props.isResuming])

    if (props.editable && !lock && !disabled && !props.isOffline) {
      return <Spinner />
    }

    if (!disabled && showEditor) {
      body = (
        <RichTextEditor
          editorKey={key.current}
          id={props.id}
          onBlur={onBlur}
          onFocus={onFocus}
          className={props.className}
          onChange={props.onChange}
          autoFocus={props.autofocus}
          selection={props.selection}
          text={props.description}
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
          imagePublicURL={resolveToPublicUrl}
          isStorageURL={isStorageURL}
          imageCache={props.imageCache}
          cacheImage={props.cacheImage}
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
    isStorageURL: PropTypes.func,
    isCloudFile: PropTypes.bool,
    isLoggedIn: PropTypes.any,
    isOffline: PropTypes.bool,
    isResuming: PropTypes.bool,
    imageCache: PropTypes.object.isRequired,
    cacheImage: PropTypes.func.isRequired,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => ({
        fileId: selectors.selectedFileIdSelector(state.present),
        clientId: selectors.clientIdSelector(state.present),
        emailAddress: selectors.emailAddressSelector(state.present),
        isCloudFile: selectors.isCloudFileSelector(state.present),
        isLoggedIn: selectors.isLoggedInSelector(state.present),
        isOffline: selectors.isOfflineSelector(state.present),
        isResuming: selectors.isResumingSelector(state.present),
        imageCache: selectors.imageCacheSelector(state.present),
      }),
      {
        cacheImage: actions.imageCache.cacheImage,
      }
    )(RichText)
  }

  throw new Error("Couldn't connect RichText")
}

export default RichTextConnector
