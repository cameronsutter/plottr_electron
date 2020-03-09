// NOTE: must use this in a file that has the DOM

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