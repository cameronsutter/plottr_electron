import { cloneDeep } from 'lodash'

import { saveImageToStorageFromURL } from 'plottr_firebase'

/** Places to look for image data:
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
    index[data] = id
    maxId = Math.max(id, maxId)
  })
  imagesInRCEContent.forEach(({ path, data }) => {
    if (!index[data]) {
      index[data] = ++maxId
    }
  })

  return index
}

export const patchImages = (rceImages, imageDataIndex, urlIndex, file) => {
  const newFile = cloneDeep(file)

  rceImages.forEach(({ path, data }) => {
    const imageId = imageDataIndex[data]
    const imageStorageURL = urlIndex[imageId]
    if (!imageStorageURL) {
      throw new Error(`Couldn't find image storage URL for image { path: ${path}, id: ${imageId} }`)
    }
    let rceImage = newFile
    cloneDeep(path).forEach((key) => {
      rceImage = rceImage[key]
    })
    delete rceImage.data
    rceImage.storageUrl = imageStorageURL
    rceImage.type = 'image-link'
  })

  delete newFile.images
  newFile.images = {}
  Object.entries(imageDataIndex).forEach(([data, imageId]) => {
    const imageStorageURL = urlIndex[imageId]
    if (!imageStorageURL) {
      throw new Error(
        `Couldn't find image storage URL for image { path: ${file.images[imageId].path}, id: ${imageId} }`
      )
    }
    newFile.images[imageId] = {
      data: '',
      id: imageId,
      name: (file.images && file.images[imageId]?.name) || '',
      path: imageStorageURL,
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

export const uploadImages = (imageDataIndex, nameIndex, userId) => {
  const dataIdTuples = Object.entries(imageDataIndex)
  return Promise.all(
    dataIdTuples.map(([data, id]) => {
      return saveImageToStorageFromURL(userId, fileNameIndex[id] || `unnamed-${id}`, data)
    })
  ).then((urls) => {
    const imageUrlIndex = {}
    urls.forEach((url, index) => {
      imageUrlIndex[dataIdTuples[index][1]] = url
    })
    return imageUrlIndex
  })
}

const extractExportAndPatch = (file, userId) => {
  const nameIndex = fileNameIndex(file)
  const extractedImages = extractImages(file)
  const imageDataIndex = imageIndex(extractedImages, file)
  return uploadImages(imageDataIndex, nameIndex, userId).then((urlIndex) => {
    return patchImages(extractedImages, imageDataIndex, urlIndex, file)
  })
}

export default extractExportAndPatch
