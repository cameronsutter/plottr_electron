// NOTE: must use this in a file that has the DOM

const reader = new FileReader()
const width = 500

// callback
export function resizeToMaxWidth (dataURL, callback) {
  const img = new Image()
  img.src = dataURL
  img.onload = () => {
    const elem = document.createElement('canvas')
    const scaleFactor = width / img.width
    elem.width = width
    elem.height = img.height * scaleFactor
    const ctx = elem.getContext('2d')
    ctx.drawImage(img, 0, 0, width, img.height * scaleFactor)
    const data = ctx.canvas.toDataURL(img)

    callback(data)
  }
}

export function readImage (file, callback) {
  reader.onload = (loadedFile => {
    return e => {
      resizeToMaxWidth(e.target.result, callback)
    }
  })(file)

  // Read the image file as a data URL
  reader.readAsDataURL(file)
}