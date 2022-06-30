import { cloneDeep } from 'lodash'
import { dataURLtoFile } from 'image-conversion'

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

function webpURLToJpeg(url) {
  return dataURLtoFile(url, 'image/jpeg')
}

const fetchAndConvertImages = (imageIndex, nameIndex, userId, fileId, downloadStorageImage) => {
  const imagesOnFirebase = Object.entries(imageIndex).filter(([key, id]) => {
    return key.startsWith('storage://')
  })
  const downloadedImagesFromFirebase = Promise.all(
    imagesOnFirebase.map(([key, id]) => {
      return downloadStorageImage(key, fileId, userId)
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
          return webpURLToJpeg(key).then((jpeg) => {
            return [jpeg, id]
          })
        })
      )
    })
    .then((imageDataWithKeys) => {
      return imageDataWithKeys.reduce((acc, next) => {
        const [jpeg, id] = next
        return {
          [id]: jpeg,
        }
      }, {})
    })
}

const extractConvertAndPatch = (file, userId, downloadStorageImage) => {
  const nameIndex = fileNameIndex(file)
  const extractedImages = extractImages(file)
  const index = imageIndex(extractedImages, file)
  return fetchAndConvertImages(index, nameIndex, userId, file.file.id, downloadStorageImage).then(
    (imageDataIndex) => {
      return patchImages(extractedImages, index, imageDataIndex, file)
    }
  )
}

export default extractConvertAndPatch
