import fs from 'fs'

export const EXAMPLE_FILES_PATH = 'examples'
export const EXAMPLE_3_FILE_NAME = 'example3.pltr'
export const EXAMPLE_3 = `${EXAMPLE_FILES_PATH}/${EXAMPLE_3_FILE_NAME}`
export const PREV_PATH = `${EXAMPLE_FILES_PATH}/.prev`
export const PREV_EXAMPLE_3 = `${PREV_PATH}/${EXAMPLE_3_FILE_NAME}`

export const copyCurrent = (fileName) => {
  fs.copyFileSync(`${EXAMPLE_FILES_PATH}/${fileName}`, `${PREV_PATH}/${fileName}`)
}

export const prevExportedPath = (fileName) => {
  return `${PREV_PATH}/${fileName}`
}

export const exportedPath = (fileName) => {
  return `${EXAMPLE_FILES_PATH}/${fileName}`
}

export const readExample3 = () => JSON.parse(fs.readFileSync(EXAMPLE_3, 'utf-8'))
