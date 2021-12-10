import React, { useEffect, useRef, useState } from 'react'
import { PropTypes } from 'prop-types'

import { checkDependencies } from './checkDependencies'

const FirebaseLoginConnector = (connector) => {
  const {
    platform: {
      log,
      firebase: { startUI, firebaseUI, onSessionChange, fetchFiles, currentUser, logOut },
      license: { checkForPro },
      isDevelopment,
    },
  } = connector
  const SETTINGS = connector.platform.settings
  checkDependencies({ log, startUI, firebaseUI, onSessionChange, fetchFiles, currentUser, logOut })

  const FirebaseLogin = ({ setUserId, setHasPro, setEmailAddress, setFileList, setChecking }) => {
    const firebaseLoginComponentRef = useRef(null)

    useEffect(() => {
      if (firebaseLoginComponentRef?.current) {
        const ui = firebaseUI()
        startUI(ui, '#firebase_login_root')
      }
    }, [firebaseLoginComponentRef])

    useEffect(() => {
      const unregister = onSessionChange((user) => {
        if (user) {
          if (setChecking) setChecking(true)
          if (isDevelopment) log.info('onSessionChange', user)
          currentUser()
            .getIdTokenResult()
            .then((token) => {
              if (token.claims.beta || token.claims.admin || token.claims.lifetime) {
                handleCheckPro(user.uid, user.email)(true)
              } else {
                if (user.email) {
                  checkForPro(user.email, handleCheckPro(user.uid, user.email))
                }
              }
            })
        }
      })
      return () => unregister()
    }, [])

    const handleCheckPro = (uid, email) => (hasPro) => {
      if (hasPro) {
        SETTINGS.set('user.frbId', uid)
        setHasPro(hasPro)
        setUserId(uid)
        setEmailAddress(email)
        if (setChecking) setChecking(false)
        fetchFiles(uid).then((files) => {
          const activeFiles = files.filter(({ deleted }) => !deleted)
          setFileList(activeFiles)
        })
      } else {
        logOut()
      }
    }

    return <div ref={firebaseLoginComponentRef} id="firebase_login_root" />
  }

  FirebaseLogin.propTypes = {
    setUserId: PropTypes.func.isRequired,
    setHasPro: PropTypes.func.isRequired,
    setEmailAddress: PropTypes.func.isRequired,
    setFileList: PropTypes.func.isRequired,
    setChecking: PropTypes.func,
  }

  const {
    redux,
    pltr: { actions },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(null, {
      setUserId: actions.client.setUserId,
      setEmailAddress: actions.client.setEmailAddress,
      setFileList: actions.project.setFileList,
      setHasPro: actions.client.setHasPro,
    })(FirebaseLogin)
  }

  throw new Error('No connector found for FirebaseLogin')
}

export default FirebaseLoginConnector
