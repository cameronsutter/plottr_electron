import fs from 'fs'

export function saveFile (filePath, jsonData) {
  let stringData = ''
  if (process.env.NODE_ENV == 'development') {
    stringData = JSON.stringify(jsonData, null, 2)
  } else {
    stringData = JSON.stringify(jsonData)
  }
  console.log('saving!', filePath, jsonData)
  fs.writeFileSync(filePath, stringData)
}
