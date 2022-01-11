import React from 'react'

import { FirebaseLogin } from 'connected-components'

const Login = () => {
  return (
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
  )
}

export default Login
