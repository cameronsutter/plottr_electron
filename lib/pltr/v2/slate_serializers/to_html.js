import { EMFJS, RTFJS, WMFJS } from 'rtf.js'
import log from 'electron-log'

RTFJS.loggingEnabled(false)
WMFJS.loggingEnabled(false)
EMFJS.loggingEnabled(false)

// String -> Promise<NodeList>
export const rtfToHTML = (arrayBuffer) => {
  const doc = new RTFJS.Document(arrayBuffer)
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
      }
      return result
    })
    .catch((error) => {
      log.error('rtfjs', error)
      return []
    })
}
