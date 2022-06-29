import { dataURLToFile, fileToDataURL } from 'image-conversion'

export function webpURLToJpeg(url) {
  return dataURLToFile(url, 'image/jpeg').then((image) => {
    return fileToDataURL(image)
  })
}
