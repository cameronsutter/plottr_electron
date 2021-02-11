import { createStore } from 'redux'
import { exec } from 'child_process'
import fs from 'fs'
import xml2js from 'xml2js'
import undoable from 'redux-undo'

import wordExporter from '../../src/common/exporter/word/exporter'
import { actions, rootReducer } from 'pltr/v2'

import {
  readExample3,
  copyCurrent,
  exportedPath,
  prevExportedPath,
  EXAMPLE_3,
  EXAMPLE_3_FILE_NAME,
} from './common'

const extract = (filePath, destDir) => {
  return new Promise((resolve, reject) => {
    exec(`unzip ${__dirname}/../../${filePath} -d ${__dirname}/../../${destDir}`, (error) => {
      if (error !== null) {
        reject(error)
        return
      }
      resolve()
    })
  })
}

describe('wordExporter', () => {
  const parser = new xml2js.Parser()
  copyCurrent('example3.docx')
  const example3 = readExample3()
  const reducer = undoable(rootReducer, { limit: 10, ignoreInitialState: true })
  const store = createStore(reducer)
  store.dispatch(actions.ui.loadFile(EXAMPLE_3, false, example3, example3.file.version))
  const oldExportedDocument = prevExportedPath('example3.docx')
  const targetPath = exportedPath('example3.docx')
  wordExporter(example3, { fileName: targetPath, bookId: 1 })
  it('should produce a file', () => {
    expect(fs.existsSync(targetPath)).toEqual(true)
  })
  it('should produce the same file document.xml file as was previously generated (note: expect this to fail if you deliberately changed the exporter)', async () => {
    const oldUnzippedDirectory = fs.mkdtempSync('word-export-test')
    await extract(oldExportedDocument, oldUnzippedDirectory)
    const newUnzippedDirectory = fs.mkdtempSync('word-export-test')
    await extract(targetPath, newUnzippedDirectory)
    const oldDocument = fs.readFileSync(`${oldUnzippedDirectory}/word/document.xml`)
    const oldDocumentJSON = await parser.parseStringPromise(oldDocument)
    const newDocument = fs.readFileSync(`${newUnzippedDirectory}/word/document.xml`)
    const newDocumentJSON = await parser.parseStringPromise(newDocument)
    expect(oldDocumentJSON).toEqual(newDocumentJSON)
    console.log(`Deleting ${oldUnzippedDirectory}`)
    fs.rmdir(oldUnzippedDirectory, { recursive: true }, (error) => {
      if (error !== null) throw new Error(error)
    })
    console.log(`Deleting ${newUnzippedDirectory}`)
    fs.rmdir(newUnzippedDirectory, { recursive: true }, (error) => {
      if (error !== null) throw new Error(error)
    })
  })
})
