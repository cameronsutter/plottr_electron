function migrate(data) {
  if (data.file && data.file.version === '2022.5.18') return data

  // Web files might not have a `ui` key.
  if (data.ui) {
    return {
      ...data,
      ui: {
        ...data.ui,
        searchTerms: {
          outline: null,
          ...data.ui.searchTerms,
        },
      },
    }
  }
  return data
}

module.exports = migrate