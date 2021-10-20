import React, { useEffect, useRef } from 'react'
import { PropTypes } from 'prop-types'

const FirebaseLoginConnector = (connector) => {
  const {
    platform: {
      firebase: { startUI, firebaseUI, onSessionChange, fetchFiles },
      isDevelopment,
    },
  } = connector

  const FirebaseLogin = ({ setUserId, setEmailAddress, setFileList, receiveUser }) => {
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
          if (isDevelopment) console.log(user)
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

    return <div ref={firebaseLoginComponentRef} id="firebase_login_root" />
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
