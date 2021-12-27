import { fileSystemAPIs } from '../../api'
import { BACKUP_BASE_PATH } from '../../file-system/config_paths'

export function backupBasePath() {
  const settings = fileSystemAPIs.currentAppSettings()
  const configuredLocation = settings.user?.backupLocation
  return (configuredLocation !== 'default' && configuredLocation) || BACKUP_BASE_PATH
}
