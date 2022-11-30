import { EMFJS, RTFJS, WMFJS } from 'rtf.js'

RTFJS.loggingEnabled(false)
WMFJS.loggingEnabled(false)
EMFJS.loggingEnabled(false)

// From: https://github.com/tbluemel/rtf.js/blob/HEAD/GETTING_STARTED.md
function stringToArrayBuffer(string) {
  const buffer = new ArrayBuffer(string.length)
  const bufferView = new Uint8Array(buffer)
  for (let i = 0; i < string.length; i++) {
    bufferView[i] = string.charCodeAt(i)
  }
  return buffer
}

// String -> Promise<NodeList>
export const rtfToHTML = (string) => {
  const doc = new RTFJS.Document(stringToArrayBuffer(string))
  return doc
    .render()
    .then((htmlElements) => {
      const nodeLists = htmlElements.map((el) => el.querySelectorAll('span'))
      const result = []
      for (let i = 0; i < nodeLists.length; ++i) {
        const nodeList = nodeLists[i]
        for (let j = 0; j < nodeList.length; ++j) {
          result.push(nodeList[j])
        }

        if (!nodeList.length) {
          const span = document.createElement('span')
          const node = document.createTextNode('...')
          result.push(span.appendChild(node))
        }
      }
      return result
    })
    .catch((error) => {
      // FIXME: this wont work on the web :/
      console.error('rtfjs', error)
      return []
    })
}
