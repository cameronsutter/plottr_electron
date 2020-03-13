import Resizer from 'react-image-file-resizer'

const maxWidth = 700
const maxHeight = 500
const format = 'JPEG' // PNG or WEBP
const quality = 50 // out of 100
const rotation = 0
const output = 'base64'

export function readImage (file, callback) {
  Resizer.imageFileResizer(file, maxWidth, maxHeight, format, quality, rotation, callback, output)
}