const { broadcastToAllWindows } = require('../broadcast')

const updateOpenFiles = (filePath) => {
  broadcastToAllWindows('file-closed', filePath)
}

module.exports = { updateOpenFiles }
