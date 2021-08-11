const { broadcastToAllWindows } = require('./broadcast')

const reloadRecents = () => {
  broadcastToAllWindows('reload-recents')
}

module.exports = { reloadRecents }
