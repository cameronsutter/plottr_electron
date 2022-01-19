import { broadcastToAllWindows } from '../broadcast'

const updateOpenFiles = (filePath) => {
  broadcastToAllWindows('file-closed', filePath)
}

export { updateOpenFiles }
