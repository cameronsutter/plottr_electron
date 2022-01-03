import React, { useEffect, useRef } from 'react'
import { PropTypes } from 'prop-types'
import { t } from 'plottr_locales'

import { checkDependencies } from './checkDependencies'

const FirebaseLoginConnector = (connector) => {
  const {
    platform: {
      dialog,
      log,
      firebase: { startUI, firebaseUI, onSessionChange, fetchFiles, currentUser, logOut },
      license: { checkForPro },
      settings: { saveAppSetting },
      isDevelopment,
    },
  } = connector
  checkDependencies({ log, startUI, firebaseUI, onSessionChange, fetchFiles, currentUser, logOut })

  // TODO: Note for next refactor stage that touches this:
  //
  // This component doesn't need to register the session listener.  It
  // only needs to know that the session changed.  The session
  // listener needs to be in the listeners that live outside of the
  // app because they determine *how* we boot the app(!)
  const FirebaseLogin = ({ setUserId, setHasPro, setEmailAddress, setFileList, isOffline }) => {
    const firebaseLoginComponentRef = useRef(null)

    useEffect(() => {
      if (firebaseLoginComponentRef?.current) {
        const ui = firebaseUI()
        startUI(ui, '#firebase_login_root')
      }
    }, [firebaseLoginComponentRef])

    useEffect(() => {
      if (isOffline) return () => {}

      const unregister = onSessionChange((user) => {
        if (user) {
          if (isDevelopment) log.info('onSessionChange', user)
          currentUser()
            .getIdTokenResult()
            .then((token) => {
              if (token.claims.beta || token.claims.admin || token.claims.lifetime) {
                handleCheckPro(user.uid, user.email)(true)
              } else {
                if (user.email) {
                  checkForPro(user.email, handleCheckPro(user.uid, user.email)).catch((error) => {
                    // TODO: maybe retry?
                    log.error('Failed to check for pro', error)
                  })
                }
              }
            })
        }
      })
      return () => unregister()
    }, [isOffline])

    const handleCheckPro = (uid, email) => (hasPro) => {
      if (hasPro) {
        saveAppSetting('user.frbId', uid)
        setHasPro(hasPro)
        setUserId(uid)
        setEmailAddress(email)
        fetchFiles(uid).then((files) => {
          const activeFiles = files.filter(({ deleted }) => !deleted)
          setFileList(activeFiles)
        })
      } else {
        logOut().then(() => {
          setUserId(null)
          setEmailAddress(null)
          dialog.showErrorBox(t('Error'), t("It doesn't look like you have a pro license."))
        })
      }
    }

    return <div ref={firebaseLoginComponentRef} id="firebase_login_root" />
  }

  FirebaseLogin.propTypes = {
    setUserId: PropTypes.func.isRequired,
    setHasPro: PropTypes.func.isRequired,
    setEmailAddress: PropTypes.func.isRequired,
    setFileList: PropTypes.func.isRequired,
    isOffline: PropTypes.bool,
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => ({
        isOffline: selectors.isOfflineSelector(state.present),
      }),
      {
        setUserId: actions.client.setUserId,
        setEmailAddress: actions.client.setEmailAddress,
        setFileList: actions.project.setFileList,
        setHasPro: actions.client.setHasPro,
      }
    )(FirebaseLogin)
  }

  throw new Error('No connector found for FirebaseLogin')
}

export default FirebaseLoginConnector
