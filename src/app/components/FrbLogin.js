import React, { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { actions } from 'pltr/v2'
import { startUI, firebaseUI, onSessionChange, fetchFiles } from 'plottr_firebase'

import SETTINGS from '../../common/utils/settings'

const FrbLogin = ({ setUserId, setFileList, receiveUserId }) => {
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
        SETTINGS.set('user.id', user.uid)
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

FrbLogin.propTypes = {
  setUserId: PropTypes.func.isRequired,
  setFileList: PropTypes.func.isRequired,
  receiveUserId: PropTypes.func,
}

export default connect(null, {
  setUserId: actions.client.setUserId,
  setFileList: actions.project.setFileList,
})(FrbLogin)
