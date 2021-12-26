import { SETTINGS } from '../../file-system/stores'
import { BACKUP_BASE_PATH } from '../../file-system/config_paths'

export function backupBasePath() {
  const configuredLocation = SETTINGS.get('user.backupLocation')
  return (configuredLocation !== 'default' && configuredLocation) || BACKUP_BASE_PATH
}
