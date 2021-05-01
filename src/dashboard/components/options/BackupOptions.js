import React, { useRef } from 'react'
import { FormGroup, HelpBlock } from 'react-bootstrap'

import { useSettingsInfo } from '../../../common/utils/store_hooks'
import { t } from 'plottr_locales'

const BackupOptions = () => {
  const [settings, _, saveSetting] = useSettingsInfo()

  const backupInputRef = useRef()

  const backupSettingValue = (name) =>
    name === 'days' ? settings.user.numberOfBackups : settings.user.backupDays

  const onBackupTypeChange = (event) => {
    const newBackupType = event.target.value
    saveSetting('user.backupType', newBackupType)
    backupInputRef.current.value = backupSettingValue(newBackupType)
  }

  const currentSetting =
    settings.user.backupType === 'days' ? 'user.numberOfBackups' : 'user.backupDays'

  const onBackupValueChange = () =>
    saveSetting(currentSetting, Number(backupInputRef.current.value))

  const handleBackupBlur = () => {
    if (backupInputRef.current.value <= 0 || backupInputRef.current.value == '') {
      backupInputRef.current.value = 1
    }
    saveSetting(currentSetting, Number(backupInputRef.current.value))
  }

  const title = settings.user.backupType === 'days' ? t('Days of Backups') : t('Number of Backups')

  return (
    <>
      <h4>{t('Backup Options')}</h4>
      <FormGroup controlId="backupDays">
        <select defaultValue={settings.user.backupType} onChange={onBackupTypeChange}>
          <option value="days">{t('Days of Backups')}</option>
          <option value="number">{t('Number of Backups')}</option>
        </select>
        <div className={'backup-type'}>
          <HelpBlock>{title}</HelpBlock>
          <input
            type="number"
            className="backup-input"
            ref={backupInputRef}
            min="1"
            defaultValue={backupSettingValue(settings.user.backupType)}
            onChange={onBackupValueChange}
            onBlur={handleBackupBlur}
          />
          <HelpBlock>{t('Backups beyond this will be erased')}</HelpBlock>
        </div>
      </FormGroup>
    </>
  )
}

export default BackupOptions
