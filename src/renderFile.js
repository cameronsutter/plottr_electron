import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import Main from 'containers/Main'
import Listener from './app/components/listener'
import Renamer from './app/components/Renamer'

import { store } from './app/store'

export const renderFile = (root) => {
  render(
    <Provider store={store}>
      <Listener />
      <Renamer />
      <Main />
    </Provider>,
    root
  )
}
