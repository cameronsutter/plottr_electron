const { getDarkMode } = require('../theme')

const newFileOptions = () => ({
  darkMode: getDarkMode(),
})

module.exports = { newFileOptions }
