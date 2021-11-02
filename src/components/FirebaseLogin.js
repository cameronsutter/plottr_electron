import React, { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'

import { checkDependencies } from './checkDependencies'

const FirebaseLoginConnector = (connector) => {
  const {
    platform: {
      log,
      useSettingsInfo,
      firebase: { startUI, firebaseUI, onSessionChange, fetchFiles },
      isDevelopment,
    },
  } = connector
  checkDependencies({ log, useSettingsInfo, startUI, firebaseUI, onSessionChange, fetchFiles })

  const FirebaseLogin = ({ setUserId, setEmailAddress, setFileList, receiveUser }) => {
    const [_settings, _size, saveSetting] = useSettingsInfo()
    const [firebaseLoginComponentRef, setFirebaseLoginComponentRef] = useState(null)

    useEffect(() => {
      if (firebaseLoginComponentRef) {
        const ui = firebaseUI()
        startUI(ui, '#firebase_login_root')
      }
    }, [firebaseLoginComponentRef])

    useEffect(() => {
      const unregister = onSessionChange((user) => {
        if (user) {
          if (isDevelopment) log.info(user)
          saveSetting('user.id', user.uid)
          saveSetting('user.email', user.email)
          setUserId(user.uid)
          setEmailAddress(user.email)
          if (receiveUser) receiveUser(user)
          fetchFiles(user.uid).then((files) => {
            const activeFiles = files.filter(({ deleted }) => !deleted)
            setFileList(activeFiles)
          })
        }
      })
      return () => unregister()
    }, [])

    return (
      <div
        ref={(ref) => {
          setFirebaseLoginComponentRef(ref)
        }}
        id="firebase_login_root"
      />
    )
  }

  FirebaseLogin.propTypes = {
    setUserId: PropTypes.func.isRequired,
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
    })(FirebaseLogin)
  }

  throw new Error('No connector found for FirebaseLogin')
}

export default FirebaseLoginConnector
