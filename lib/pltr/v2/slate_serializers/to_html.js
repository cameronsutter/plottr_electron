import { EMFJS, RTFJS, WMFJS } from 'rtf.js'
import { convertHTMLString } from './from_html'

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

export const rtfToHTML = async (content) => {
  const doc = new RTFJS.Document(stringToArrayBuffer(String(content)))
  const parsed = await doc
    .render()
    .then((htmlElements) => {
      console.log('htmlElements', htmlElements)
      const spanEl = htmlElements.map((el) => el.querySelectorAll('span'))
      const textContents = spanEl.map((el) => {
        if (el && el[0]) {
          const HTMLString = convertHTMLString(el[0].textContent)
          if (HTMLString.length) {
            return HTMLString
          }
        }
      })
      if (textContents) {
        return {
          type: 'paragraph',
          children: textContents,
        }
      }
    })
    .then((res) => res)
    .catch((error) => console.log('rtfjs', error))

  if (parsed) {
    return parsed
  }
}
