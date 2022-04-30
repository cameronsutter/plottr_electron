function migrate(data) {
  if (data.file && data.file.version === '2022.5.18') return data

  if (!data.ui.searchTerms) {
    return {
      ...data,
      ui: {
        ...data.ui,
        searchTerms: {
          notes: null,
          characters: null,
          places: null,
          tags: null,
        },
      },
    }
  }
  return data
}

module.exports = migrate
