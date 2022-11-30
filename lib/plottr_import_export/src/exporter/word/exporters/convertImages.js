import axios from 'axios'
import { cloneDeep } from 'lodash'
import { dataURLtoFile, filetoDataURL } from 'image-conversion'

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
  indexedImages.forEach(({ id, name, path, data }) => {
    index[(data.length > 0 && data) || path] = id
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

  rceImages.forEach(({ path, storageUrl, data }) => {
    const imageId = imageIndex[data] || imageIndex[storageUrl]
    const imageData = dataIndex[imageId]

    let rceImage = newFile
    cloneDeep(path).forEach((key) => {
      rceImage = rceImage[key]
    })
    delete rceImage.storageUrl
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

function webpURLToJpeg(url) {
  if (typeof window === 'undefined') {
    return axios.get(url).then((response) => {
      return response.data
    })
  }
  return dataURLtoFile(url, 'image/jpeg')
}

function imageBlobToJpeg(imageBlob) {
  if (typeof window === 'undefined') {
    // For NextJS, so that it doesn't try to import this in-browser.
    const sharp = require('sharp')
    return sharp(imageBlob).toFormat('jpeg').toBuffer()
  }

  return filetoDataURL(imageBlob).then(webpURLToJpeg)
}

function imageToWebpDataURL(imageBlob) {
  return filetoDataURL(imageBlob)
}

const fetchAndConvertImages = (
  imageIndex,
  nameIndex,
  userId,
  fileId,
  downloadStorageImage,
  convertToBlob = true
) => {
  const imagesOnFirebase = Object.entries(imageIndex).filter(([key, id]) => {
    return key.startsWith('storage://')
  })
  const downloadedImagesFromFirebase = Promise.all(
    imagesOnFirebase.map(([key, id]) => {
      return downloadStorageImage(key, fileId, userId).then((image) => {
        const convertedImage = convertToBlob ? imageBlobToJpeg(image) : imageToWebpDataURL(image)
        return convertedImage.then((jpeg) => {
          return [jpeg, id]
        })
      })
    })
  )
  const localImages = Object.entries(imageIndex).filter(([key, id]) => {
    return !key.startsWith('storage://') && key.startsWith('data:image')
  })
  return downloadedImagesFromFirebase
    .then((downloadedImages) => {
      return Promise.all(
        localImages.map(([key, id]) => {
          return convertToBlob
            ? webpURLToJpeg(key).then((jpeg) => {
                return [jpeg, id]
              })
            : key
        })
      ).then((localImages) => {
        return [...downloadedImages, ...localImages]
      })
    })
    .then((imageDataWithKeys) => {
      return imageDataWithKeys.reduce((acc, next) => {
        const [jpeg, id] = next
        return {
          ...acc,
          [id]: jpeg,
        }
      }, {})
    })
}

const extractConvertAndPatch = (file, userId, downloadStorageImage, convertToBlob = true) => {
  const nameIndex = fileNameIndex(file)
  const extractedImages = extractImages(file)
  const index = imageIndex(extractedImages, file)
  return fetchAndConvertImages(
    index,
    nameIndex,
    userId,
    file.file.id,
    downloadStorageImage,
    convertToBlob
  ).then((imageDataIndex) => {
    return patchImages(extractedImages, index, imageDataIndex, file)
  })
}

export default extractConvertAndPatch
