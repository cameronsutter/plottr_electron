const settingsModule = (stores) => {
  const { SETTINGS } = stores

  const readSettings = () => {
    // Old API for legacy settings
    return Promise.resolve(SETTINGS.store)
  }

  return { readSettings }
}

export default settingsModule
