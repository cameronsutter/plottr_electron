import SETTINGS from '../../common/utils/settings'
import { BACKUP_BASE_PATH } from '../../common/utils/config_paths'

export function backupBasePath() {
  const configuredLocation = SETTINGS.get('user.backupLocation')
  return (configuredLocation !== 'default' && configuredLocation) || BACKUP_BASE_PATH
}
