const fs = require('fs')

const SOURCE_PATH = 'src/css'
const DIST_DIR = 'dist'
const DESTINATION_PATH = 'dist/components'

fs.readdir(SOURCE_PATH, (error, files) => {
  if (error) {
    throw error
  }

  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR)
  }

  if (!fs.existsSync(DESTINATION_PATH)) {
    fs.mkdirSync(DESTINATION_PATH)
  }

  const copyOperations = files
    .filter((file) => file.match(/\.woff2$/))
    .map((file) => {
      const sourceFile = `${SOURCE_PATH}/${file}`
      const destinationFile = `${DESTINATION_PATH}/${file}`
      console.log(`cp ${sourceFile} ${destinationFile}`)
      return new Promise((resolve, reject) => {
        fs.copyFile(sourceFile, destinationFile, null, (error) => {
          if (error) {
            reject(error)
          }
          resolve(sourceFile)
        })
      })
    })

  Promise.all(copyOperations)
    .then((result) => {
      console.log('Success!')
    })
    .catch((error) => {
      throw error
    })
})
