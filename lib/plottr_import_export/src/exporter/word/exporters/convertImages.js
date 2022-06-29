import Resizer from 'react-image-file-resizer'
import { cloneDeep } from 'lodash'
import { v4 as uuid } from 'uuid'
import { dataURLToFile, fileToDataURL } from 'image-conversion'

import { imagePublicURL } from 'wired-up-firebase'

/** NOTE: Ripped from extract_images in plottr_electron.
 *
 * Places to look for image data:
 *
 * Card:
 *  - any attr at root level
 *  - (card).templates[x].attributes[y].value
 *  - desrciption
 *
 * Characters:
 *  - any attr at root level
 *  - (character).templates[x].(attributeName).value
 *  - notes
 *
 * Notes:
 *  - any attr at root level
 *  - content
 *
 * Places:
 *  - any attr at root level
 *  - notes
 *
 * Despite tracking down all of the places where the image-data can
 * live, I still want to create a general solution to the problem.
 */
export const extractImages = (file) => {
  const nodesFound = []

  function walkFile(node, path) {
    if (Array.isArray(node)) {
      node.forEach((subNode, idx) => {
        walkFile(subNode, [...path, idx])
      })
    } else if (node?.type === 'image-data' && node.data) {
      nodesFound.push({ path, data: node.data })
    } else if (node?.type === 'image-link' && node.storageUrl) {
      nodesFound.push({ path, storageUrl: node.storageUrl })
    } else if (node && typeof node !== 'string') {
      Object.keys(node).forEach((key) => {
        walkFile(node[key], [...path, key])
      })
    }
  }
  walkFile(file, [])

  return nodesFound
}

export const imageIndex = (imagesInRCEContent, file) => {
  const indexedImages = (file.images && Object.values(file.images)) || []

  const index = {}
  let maxId = Number.NEGATIVE_INFINITY
  indexedImages.forEach(({ id, name, path, data, storageUrl }) => {
    index[data || storageUrl] = id
    maxId = Math.max(id, maxId)
  })
  imagesInRCEContent.forEach(({ path, data, storageUrl }) => {
    const key = data || storageUrl
    if (!index[key]) {
      index[key] = ++maxId
    }
  })

  return index
}

export const patchImages = (rceImages, imageIndex, dataIndex, file) => {
  const newFile = cloneDeep(file)

  rceImages.forEach(({ path, data }) => {
    const imageId = imageIndex[data]
    const imageData = dataIndex[imageId]

    let rceImage = newFile
    cloneDeep(path).forEach((key) => {
      rceImage = rceImage[key]
    })
    rceImage.data = imageData
    rceImage.type = 'image-data'
  })

  delete newFile.images
  newFile.images = {}
  Object.entries(imageIndex).forEach(([data, imageId]) => {
    const imageData = dataIndex[imageId]
    newFile.images[imageId] = {
      data: imageData,
      id: imageId,
      name: (file.images && file.images[imageId]?.name) || '',
      path: '',
    }
  })

  return newFile
}

export const fileNameIndex = (file) => {
  const nameIndex = {}
  Object.values(file.images).forEach(({ id, name }) => {
    nameIndex[id] = name
  })
  return nameIndex
}

const sequentially = (promiseThunks) => {
  return promiseThunks.reduce((accPromise, next) => {
    return accPromise.then((acc) => {
      return next().then((result) => {
        return [...acc, result]
      })
    })
  }, Promise.resolve([]))
}

const maxWidth = 700
const maxHeight = 500
const format = 'WEBP' // PNG or WEBP
const quality = 50 // out of 100
const rotation = 0
const output = 'base64'

export function resizeImage(file, callback) {
  Resizer.imageFileResizer(file, maxWidth, maxHeight, format, quality, rotation, callback, output)
}

export function webpURLToJpeg(url) {
  return dataURLToFile(url, 'image/jpeg').then((image) => {
    return fileToDataURL(image)
  })
}

export const uploadImages = (imageDataIndex, nameIndex, userId) => {
  const dataIdTuples = Object.entries(imageDataIndex)
  return sequentially(
    dataIdTuples.map(([data, id]) => () => {
      const fileName = nameIndex[id] || `unnamed-${uuid()}`
      return fetch(data)
        .then((response) => {
          return response.blob()
        })
        .then((blob) => {
          return new File([blob], fileName)
        })
        .then((file) => {
          return new Promise((resolve, reject) => {
            try {
              resizeImage(file, resolve)
            } catch (error) {
              reject(error)
            }
          })
        })
        .then((resizedData) => {
          return saveImageToStorageFromURL(userId, fileName, resizedData)
        })
    })
  ).then((urls) => {
    const imageUrlIndex = {}
    urls.forEach((url, index) => {
      imageUrlIndex[dataIdTuples[index][1]] = url
    })
    return imageUrlIndex
  })
}

export const fetchAndConvertImages = (imageIndex, nameIndex, userId, fileId) => {
  const imagesOnFirebase = Object.entries(imageIndex).filter(([key, id]) => {
    return key.startsWith('storage://')
  })
  const downloadedImagesFromFirebase = Promise.all(
    imagesOnFirebase.map(([key, id]) => {
      return imagePublicURL(key, fileId, userId)
    })
  )
  const localImages = Object.entries(imageIndex).filter(([key, id]) => {
    return !key.startsWith('storage://')
  })
  return downloadedImagesFromFirebase
    .then((downloadedImages) => {
      return [...downloadedImages, ...localImages]
    })
    .then((images) => {
      return Promise.all(
        images.map(([key, id]) => {
          return webpURLToJpeg(key).then((jpegUrl) => {
            return [jpegUrl, id]
          })
        })
      )
    })
}

const extractExportAndPatch = (file, userId) => {
  const nameIndex = fileNameIndex(file)
  const extractedImages = extractImages(file)
  const index = imageIndex(extractedImages, file)
  return fetchAndConvertImages(index, nameIndex, userId).then((imageDataIndex) => {
    return patchImages(extractedImages, imageIndex, imageDataIndex, file)
  })
}

export default extractExportAndPatch
