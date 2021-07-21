const { broadcastToAllWindows } = require('./broadcast')

export const reloadRecents = () => {
  broadcastToAllWindows('reload-recents')
}
