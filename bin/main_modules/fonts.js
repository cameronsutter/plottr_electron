const fontList = require('font-list')

let usableFonts = []

function availableFonts () {
  return usableFonts
}

function fetchFonts () {
  fontList.getFonts()
    .then(fonts => {
      usableFonts = fonts
    })
    .catch(err => {
      console.log(err)
    })
}

module.exports = { fetchFonts, availableFonts }