import React, { useRef } from 'react'
import { FormGroup, HelpBlock } from 'react-bootstrap'

import { useSettingsInfo } from '../../../common/utils/store_hooks'
import { t } from 'plottr_locales'

const BackupOptions = () => {
  const [settings, _, saveSetting] = useSettingsInfo()

  const backupInputRef = useRef()

  const backupSettingValue = (name) => {
    switch (name) {
      case 'never-delete':
        return Number.POSITIVE_INFINITY
      case 'days':
        return settings.user.backupDays
      case 'number':
        return settings.user.numberOfBackups
    }
    return Number.POSITIVE_INFINITY
  }

  const onBackupTypeChange = (event) => {
    const newBackupType = event.target.value
    saveSetting('user.backupType', newBackupType)
    backupInputRef.current.value = backupSettingValue(newBackupType)
  }

  const currentSetting = (() => {
    switch (settings.user.backupType) {
      case 'never-delete':
        return null
      case 'days':
        return 'user.backupDays'
      case 'number':
        return 'user.numberOfBackups'
    }
    return Number.POSITIVE_INFINITY
  })()

  const onBackupValueChange = () => {
    if (currentSetting) saveSetting(currentSetting, Number(backupInputRef.current.value))
  }

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
          <option value="never-delete">{t('Never Delete Backups')}</option>
        </select>
        <div className={'backup-type'}>
          <HelpBlock>{title}</HelpBlock>
          <input
            disabled={!currentSetting}
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
