import { featureFlags } from './feature_flags'

const newFileOptions = () => ({
  ...featureFlags(),
})

export { newFileOptions }
