import React, { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'
import { PlottrModal } from 'connected-components'
import { connect } from 'react-redux'

import { actions } from 'pltr/v2'
import { startUI, firebaseUI, onSessionChange, fetchFiles } from 'plottr_firebase'

import SETTINGS from '../../common/utils/settings'

const modalStyles = {
  overlay: {
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 0,
    borderRadius: 0,
    overflow: 'hidden',
    width: '100%',
    position: 'relative',
    left: '0',
    top: '0',
    minHeight: '100vh',
    maxHeight: '100vh',
  },
}

const LoginModal = ({ closeLoginModal, setUserId, setFileList }) => {
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
        fetchFiles(user.uid).then((files) => {
          const activeFiles = files.filter(({ deleted }) => !deleted)
          setFileList(activeFiles)
        })
      }
    })
  }, [])

  return (
    <PlottrModal isOpen={true} onRequestClose={closeLoginModal} style={modalStyles}>
      <div className="login">
        <div className="login__main">
          <div className="login__left">
            <h1>Welcome to Plottr</h1>
            <div
              ref={(ref) => {
                setFirebaseLoginComponentRef(ref)
              }}
              id="firebase_login_root"
            />
          </div>
          <div className="login__right">
            <div className="login__logo">
              <img src="../icons/logo_28_500.png" alt="Plottr Logo" width="358" height="500" />
            </div>
          </div>
        </div>
      </div>
    </PlottrModal>
  )
}

LoginModal.propTypes = {
  closeLoginModal: PropTypes.func.isRequired,
  setUserId: PropTypes.func.isRequired,
  setFileList: PropTypes.func.isRequired,
}

export default connect(null, {
  setUserId: actions.client.setUserId,
  setFileList: actions.project.setFileList,
})(LoginModal)
