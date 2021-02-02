const request = require('request').defaults({ encoding: null })
import Resizer from 'react-image-file-resizer'
import imageExtensions from 'image-extensions'
import isUrl from 'is-url'

const maxWidth = 700
const maxHeight = 500
const format = 'JPEG' // PNG or WEBP
const quality = 50 // out of 100
const rotation = 0
const output = 'base64'

export function readImage(file, callback) {
  Resizer.imageFileResizer(file, maxWidth, maxHeight, format, quality, rotation, callback, output)
}

export function isImageUrl(url) {
  if (!url) return false
  if (!isUrl(url)) return false
  const ext = new URL(url).pathname.split('.').pop()
  return imageExtensions.includes(ext)
}

export function readImageFromURL(url, callback) {
  // TODO: be able to resize this
  request(url, (err, response, body) => {
    if (!err && response.statusCode == 200) {
      const str =
        'data:' +
        response.headers['content-type'] +
        ';base64,' +
        Buffer.from(body).toString('base64')
      callback(str)
    }
  })
}
