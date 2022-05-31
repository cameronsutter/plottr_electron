import React from 'react'

const MainIntegrationContext = React.createContext({
  saveFile: (filePath, data) => {
    throw new Error(`Couldn't save file at ${filePath} with data: ${data} because `)
  },
})

export default MainIntegrationContext
