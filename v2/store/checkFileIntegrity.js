import { uniq } from 'lodash'

import { emptyFile, SYSTEM_REDUCER_KEYS } from 'pltr/v2'

const BLANK_FILE = emptyFile()

export const checkForMinimalSetOfKeys =
  (filePath, actionTrail = []) =>
  (file) => {
    const hasMinimalSetOfKeys = Object.keys(BLANK_FILE).every((key) => key in file)
    if (!hasMinimalSetOfKeys) {
      const missingKeys = Object.keys(BLANK_FILE).reduce((acc, key) => {
        if (key in file) return acc
        else return [key, ...acc]
      }, [])
      const errorMessage = `Tried to save file at ${filePath} but after removing system keys it lacks the following expected keys: ${missingKeys}.  Action trail: ${JSON.stringify(
        actionTrail
      )}`
      return Promise.reject(new Error(errorMessage))
    }

    return Promise.resolve(file)
  }

export const checkForMissingCharacterAttributes =
  (filePath, actionTrail = []) =>
  (file) => {
    const characterAttributes = file?.attributes?.characters
    if (!characterAttributes) {
      const errorMessage = `Tried to save file at ${filePath}, but it doesn't have character attributes.  Action trail: ${JSON.stringify(
        actionTrail
      )}`
      return Promise.reject(new Error(errorMessage))
    }

    const attributesOnCharacters = uniq(
      (file.characters || []).flatMap(({ attributes }) => {
        return (attributes || []).map(({ id }) => {
          return id
        })
      })
    )
    const missingIds = attributesOnCharacters.filter((id) => {
      return !characterAttributes.some((attribute) => {
        return attribute.id === id
      })
    })

    if (missingIds.length > 0) {
      const errorMessage = `Tried to save file at ${filePath}, but one or more of the attributes on characters aren't in the "attributes" collection (${missingIds}).  Action trail: ${JSON.stringify(
        actionTrail
      )}`
      return Promise.reject(new Error(errorMessage))
    }

    return Promise.resolve(file)
  }

export const checkForBrokenCharacterAttributesRelationships =
  (filePath, actionTrail = []) =>
  (file) => {
    const characterAttributes = file?.attributes?.characters
    if (!characterAttributes) {
      const errorMessage = `Tried to save file at ${filePath}, but it doesn't have character attributes.  Action trail: ${JSON.stringify(
        actionTrail
      )}`
      return Promise.reject(new Error(errorMessage))
    }
    const brokenAttributeMetadata = characterAttributes.filter((attribute) => {
      return !attribute.id || !attribute.type || !attribute.name
    })
    if (brokenAttributeMetadata.length > 0) {
      const errorMessage = `Tried to save file at ${filePath}, but it has broken character attribute metadata: ${JSON.stringify(
        brokenAttributeMetadata
      )}.  Action trail: ${JSON.stringify(actionTrail)}`
      return Promise.reject(new Error(errorMessage))
    }

    const attributesOnCharacters = uniq(
      (file.characters || []).flatMap(({ attributes }) => {
        return attributes || []
      })
    )
    const brokenCharacterAttributes = attributesOnCharacters.filter((attribute) => {
      return (
        !attribute.id ||
        !attribute.bookId ||
        (attribute.bookId !== 'all' && file.books.allIds.indexOf(parseInt(attribute.bookId)) === -1)
      )
    })
    if (brokenCharacterAttributes.length > 0) {
      const errorMessage = `Tried to save file at ${filePath}, but it has broken character attribute values: ${JSON.stringify(
        brokenCharacterAttributes
      )}.  Action trail: ${JSON.stringify(actionTrail)}`
      return Promise.reject(new Error(errorMessage))
    }

    const thereIsADuplicatedCharacterAttributeValue = file.characters.some((character) => {
      const characterAttributes = character.attributes || []
      return characterAttributes.some((attribute, index) => {
        return characterAttributes.some((otherAttribute, otherIndex) => {
          return index !== otherIndex && attribute.id === otherAttribute.id
        })
      })
    })
    if (thereIsADuplicatedCharacterAttributeValue) {
      const errorMessage = `Tried to save file at ${filePath}, but it has a duplicated character attribute value.  Action trail: ${JSON.stringify(
        actionTrail
      )}`
      return Promise.reject(new Error(errorMessage))
    }

    return Promise.resolve(file)
  }

const checkFileIntegrety = (file, filePath, actionTrail = []) => {
  return checkForMinimalSetOfKeys(filePath, actionTrail)(file)
    .then(checkForMissingCharacterAttributes(filePath, actionTrail))
    .then(checkForBrokenCharacterAttributesRelationships(filePath, actionTrail))
}

export default checkFileIntegrety
