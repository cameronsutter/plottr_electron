import { imagePublicURL } from 'wired-up-firebase'

export const downloadStorageImage = (storageURL, fileId, userId) => {
  return imagePublicURL(storageURL, fileId, userId).then((url) => {
    return fetch(url).then((response) => {
      return response.blob()
    })
  })
}

export const makeCachedDownloadStorageImage = (downloadStorageImage) => {
  let cache = new Map()

  const purgeCache = () => {
    cache.clear()
  }
  const _downloadStorageItem = (storageURL, fileId, userId) => {
    if (cache.has(storageURL)) {
      return Promise.resolve(cache.get(storageURL))
    }

    return downloadStorageImage(storageURL, fileId, userId).then((result) => {
      cache.set(storageURL, result)
      return result
    })
  }

  return {
    purgeCache,
    downloadStorageImage: _downloadStorageItem,
  }
}
