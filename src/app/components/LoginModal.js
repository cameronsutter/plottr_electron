import React from 'react'
import { PropTypes } from 'prop-types'
import { PlottrModal, FirebaseLogin } from 'connected-components'

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

export default function LoginModal({ closeLoginModal }) {
  return (
    <PlottrModal isOpen={true} onRequestClose={closeLoginModal} style={modalStyles}>
      <div className="login">
        <div className="login__main">
          <div className="login__left">
            <h1>Welcome to Plottr</h1>
            <FirebaseLogin />
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
}
