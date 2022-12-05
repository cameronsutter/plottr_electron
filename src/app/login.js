import React, { useRef, useEffect } from 'react'
import { render } from 'react-dom'

import { onSessionChange } from 'wired-up-firebase'
import { startUI } from 'plottr_firebase'

const Login = () => {
  const firebaseLoginComponentRef = useRef(null)

  useEffect(() => {
    if (firebaseLoginComponentRef?.current) {
      startUI('#firebase_login_root')
    }
  }, [firebaseLoginComponentRef])

  useEffect(() => {
    const unregister = onSessionChange((user) => {
      if (user) {
        window.close()
      }
    })
    return () => unregister()
  }, [])

  return <div ref={firebaseLoginComponentRef} id="firebase_login_root" />
}

render(<Login />, document.getElementById('react-root'))
