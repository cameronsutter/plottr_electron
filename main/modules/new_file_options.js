import { getDarkMode } from './theme'
import { featureFlags } from './feature_flags'

const newFileOptions = () => ({
  darkMode: getDarkMode(),
  ...featureFlags(),
})

export { newFileOptions }
