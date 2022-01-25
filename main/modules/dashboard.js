import { broadcastToAllWindows } from './broadcast'

const reloadRecents = () => {
  broadcastToAllWindows('reload-recents')
}

export { reloadRecents }
