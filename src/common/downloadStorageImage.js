import axios from 'axios'

import { imagePublicURL } from 'wired-up-firebase'

export const downloadStorageImage = (storageURL) => {
  return imagePublicURL(storageURL).then((url) => {
    return axios.get(url).then((response) => {
      return Buffer.from(response.data, 'binary').toString('base64')
    })
  })
}
