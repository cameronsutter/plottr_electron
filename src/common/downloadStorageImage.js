import { imagePublicURL } from 'wired-up-firebase'

export const downloadStorageImage = (storageURL, fileId, userId) => {
  return imagePublicURL(storageURL, fileId, userId).then((url) => {
    return fetch(url).then((response) => {
      return response.blob()
    })
  })
}
