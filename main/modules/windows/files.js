import { broadcastToAllWindows } from '../broadcast'

export const updateOpenFiles = (filePath) => {
  broadcastToAllWindows('file-closed', filePath)
}
