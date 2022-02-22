import { EMFJS, RTFJS, WMFJS } from 'rtf.js'
import log from 'electron-log'

RTFJS.loggingEnabled(false)
WMFJS.loggingEnabled(false)
EMFJS.loggingEnabled(false)

const stringToArrayBuffer = (string) => {
  const buffer = new ArrayBuffer(string.length)
  const bufferView = new Uint8Array(buffer)
  for (let i = 0; i < string.length; i++) {
    bufferView[i] = string.charCodeAt(i)
  }
  return buffer
}

// String -> Promise<NodeList>
export const rtfConverter = (content) => {
  const doc = new RTFJS.Document(stringToArrayBuffer(String(content)))
  return doc
    .render()
    .then((htmlElements) => {
      return Promise.all(htmlElements.map((el) => el.querySelectorAll('span')))
    })
    .catch((error) => {
      log.error('rtfjs', error)
      return []
    })
}
