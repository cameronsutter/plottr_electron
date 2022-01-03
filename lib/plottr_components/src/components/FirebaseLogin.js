import React, { useEffect, useRef } from 'react'

import { checkDependencies } from './checkDependencies'

const FirebaseLoginConnector = (connector) => {
  const {
    platform: {
      firebase: { startUI, firebaseUI },
    },
  } = connector
  checkDependencies({ startUI, firebaseUI })

  const FirebaseLogin = () => {
    const firebaseLoginComponentRef = useRef(null)

    useEffect(() => {
      if (firebaseLoginComponentRef?.current) {
        const ui = firebaseUI()
        startUI(ui, '#firebase_login_root')
      }
    }, [firebaseLoginComponentRef])

    return <div ref={firebaseLoginComponentRef} id="firebase_login_root" />
  }

  FirebaseLogin.propTypes = {}

  return FirebaseLogin
}

export default FirebaseLoginConnector
