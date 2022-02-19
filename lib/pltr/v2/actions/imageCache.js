import { CACHE_IMAGE } from '../constants/ActionTypes'

export const cacheImage = (storageUrl, publicUrl) => ({
  type: CACHE_IMAGE,
  storageUrl,
  publicUrl,
  timestamp: new Date(),
})
