import React, { useEffect, useRef } from 'react'
import { PropTypes } from 'prop-types'

import { checkDependencies } from './checkDependencies'

const FirebaseLoginConnector = (connector) => {
  const {
    platform: {
      log,
      useSettingsInfo,
      firebase: { startUI, firebaseUI, onSessionChange, fetchFiles },
      license: { checkForPro },
      isDevelopment,
    },
  } = connector
  checkDependencies({ log, useSettingsInfo, startUI, firebaseUI, onSessionChange, fetchFiles })

  const FirebaseLogin = ({ setUserId, setHasPro, setEmailAddress, setFileList, receiveUser }) => {
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
          if (isDevelopment) log.info(user)
          setUserId(user.uid)
          setEmailAddress(user.email)
          if (receiveUser) receiveUser(user)
          checkForPro(user.email, (hasPro) => {
            if (hasPro) {
              setHasPro(hasPro)
              fetchFiles(user.uid).then((files) => {
                const activeFiles = files.filter(({ deleted }) => !deleted)
                setFileList(activeFiles)
              })
            }
          })
        }
      })
      return () => unregister()
    }, [])

    return <div ref={firebaseLoginComponentRef} id="firebase_login_root" />
  }

  FirebaseLogin.propTypes = {
    setUserId: PropTypes.func.isRequired,
    setHasPro: PropTypes.func.isRequired,
    setEmailAddress: PropTypes.func.isRequired,
    setFileList: PropTypes.func.isRequired,
    receiveUser: PropTypes.func,
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
