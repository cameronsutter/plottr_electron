const { getDarkMode } = require('./theme')
const { featureFlags } = require('./feature_flags')

const newFileOptions = () => ({
  darkMode: getDarkMode(),
  ...featureFlags(),
})

module.exports = {
  newFileOptions,
}
