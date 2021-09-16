import React, { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'

const FirebaseLoginConnector = (connector) => {
  const {
    platform: {
      useSettingsInfo,
      firebase: { startUI, firebaseUI, onSessionChange, fetchFiles },
    },
  } = connector

  const FirebaseLogin = ({ setUserId, setFileList, receiveUserId }) => {
    const [_settings, _size, saveSetting] = useSettingsInfo()
    const [firebaseLoginComponentRef, setFirebaseLoginComponentRef] = useState(null)

    useEffect(() => {
      if (firebaseLoginComponentRef) {
        const ui = firebaseUI()
        startUI(ui, '#firebase_login_root')
      }
    }, [firebaseLoginComponentRef])

    useEffect(() => {
      onSessionChange((user) => {
        if (user) {
          saveSetting('user.id', user.uid)
          setUserId(user.uid)
          if (receiveUserId) receiveUserId(user.uid)
          fetchFiles(user.uid).then((files) => {
            const activeFiles = files.filter(({ deleted }) => !deleted)
            setFileList(activeFiles)
          })
        }
      })
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
    setFileList: PropTypes.func.isRequired,
    receiveUserId: PropTypes.func,
  }

  const {
    redux,
    pltr: { actions },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect(null, {
      setUserId: actions.client.setUserId,
      setFileList: actions.project.setFileList,
    })(FirebaseLogin)
  }

  throw new Error('No connector found for FirebaseLogin')
}

export default FirebaseLoginConnector
