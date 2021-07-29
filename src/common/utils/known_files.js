import path from 'path'

// TODO: days left in trial mode?
export function displayFileName(filePath) {
  const devMessage = process.env.NODE_ENV == 'development' ? ' - DEV' : ''
  const baseFileName = ` - ${path.basename(filePath)}`
  return `Plottr${baseFileName}${devMessage}`
}
