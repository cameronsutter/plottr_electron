import React from 'react'

const MainIntegrationContext = React.createContext({
  saveFile: (filePath, data) => {
    throw new Error(
      `Couldn't save file at ${filePath} with data: ${data}.  Please wire up the MainIntegrationContext producer.`
    )
  },
  basename: (filePath) => {
    throw new Error(
      `Couldn't produce the basename of ${filePath}.  Please wire up the MainIntegrationContext producer.`
    )
  },
  readFile: (filePath) => {
    throw new Error(
      `Couldn't read file at ${filePath}.  Please wire up the MainIntegrationContext producer.`
    )
  },
})

export default MainIntegrationContext
