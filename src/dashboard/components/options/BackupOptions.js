import React, { useRef, useEffect } from 'react'
import { FormGroup, HelpBlock } from 'react-bootstrap'

import { useSettingsInfo } from '../../../common/utils/store_hooks'
import { t } from 'plottr_locales'

const BackupOptions = () => {
  const [settings, _, saveSetting] = useSettingsInfo()

  const resetAmounts = () => {
    saveSetting('user.backupDays', null)
    saveSetting('user.numberOfBackups', null)
  }

  useEffect(() => {
    if (settings.user.backupType === 'never-delete') {
      resetAmounts()
    }
  }, [])

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
    if (newBackupType === 'never-delete') {
      resetAmounts()
    }
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
    return null
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

  const currentBackupType = settings.user.backupType || 'never-delete'

  return (
    <>
      <h4>{t('Backup Options')}</h4>
      <FormGroup controlId="backupDays">
        <select defaultValue={currentBackupType} onChange={onBackupTypeChange}>
          <option value="days">{t('Days of Backups')}</option>
          <option value="number">{t('Number of Backups')}</option>
          <option value="never-delete">{t('Never Delete Backups')}</option>
        </select>
        {currentBackupType !== 'never-delete' ? (
          <div className={'backup-type'}>
            <HelpBlock className="dashboard__options-item-help">{title}</HelpBlock>
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
            <p className="text-danger">{t('Backups beyond this will be erased')}</p>
          </div>
        ) : null}
      </FormGroup>
    </>
  )
}

export default BackupOptions
