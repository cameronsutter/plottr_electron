const isPlottrCloudFile = (filePath) => filePath && filePath.startsWith('plottr://')

module.exports = {
  isPlottrCloudFile,
}
