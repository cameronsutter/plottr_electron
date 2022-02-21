const { EMFJS, RTFJS, WMFJS } = require('rtf.js')
const log = require('electron-log')

RTFJS.loggingEnabled(false)
WMFJS.loggingEnabled(false)
EMFJS.loggingEnabled(false)

function stringToArrayBuffer(string) {
  const buffer = new ArrayBuffer(string.length)
  const bufferView = new Uint8Array(buffer)
  for (let i = 0; i < string.length; i++) {
    bufferView[i] = string.charCodeAt(i)
  }
  return buffer
}

// String -> Promise<NodeList>
export async function rtfConverter(content) {
  console.log('content', content)
  const doc = new RTFJS.Document(stringToArrayBuffer(String(content)))
  return doc
    .render()
    .then((htmlElements) => {
      return htmlElements.map((el) => el.querySelectorAll('span'))
    })
    .catch((error) => {
      log.error('rtfjs', error)
      return []
    })
}
