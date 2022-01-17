import path from 'path'

// TODO: days left in trial mode?
export function displayFileName(filePath, isCloudFile) {
  const devMessage = process.env.NODE_ENV == 'development' ? ' - DEV' : ''
  const baseFileName = ` - ${path.basename(filePath)}`
  const plottr = isCloudFile ? 'Plottr Pro' : 'Plottr'
  return `${plottr}${baseFileName}${devMessage}`
}
