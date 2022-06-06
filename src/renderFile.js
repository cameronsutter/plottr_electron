import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import Main from 'containers/Main'
import Listener from './app/components/listener'
import Renamer from './app/components/Renamer'
import SaveAs from './app/components/SaveAs'
import Error from './app/components/Error'
import MainIntegrationContext from './mainIntegrationContext'

import { store } from './app/store'

export const renderFile = (root, whenClientIsReady) => {
  const saveFile = (filePath, file) => {
    return whenClientIsReady(({ saveFile }) => {
      return saveFile(filePath, file)
    })
  }

  render(
    <Provider store={store}>
      <MainIntegrationContext.Provider value={{ saveFile }}>
        <Listener />
        <Renamer />
        <SaveAs />
        <Error />
        <Main />
      </MainIntegrationContext.Provider>
    </Provider>,
    root
  )
}
