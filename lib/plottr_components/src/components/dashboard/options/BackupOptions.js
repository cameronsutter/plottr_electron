import React, { useRef, useEffect } from 'react'
import { PropTypes } from 'prop-types'
import { HelpBlock } from 'react-bootstrap'

import { t } from 'plottr_locales'

import FormGroup from '../../FormGroup'
import { checkDependencies } from '../../checkDependencies'

const BackupOptionsConnector = (connector) => {
  const {
    platform: {
      settings: { saveAppSetting },
    },
  } = connector
  checkDependencies({ saveAppSetting })

  const BackupOptions = ({ settings }) => {
    const resetAmounts = () => {
      saveAppSetting('user.backupDays', null)
      saveAppSetting('user.numberOfBackups', null)
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
      saveAppSetting('user.backupType', newBackupType)
      if (newBackupType === 'never-delete') {
        resetAmounts()
      }
    }

    useEffect(() => {
      if (backupInputRef.current) {
        backupInputRef.current.value = backupSettingValue(settings.user.backupType)
        backupInputRef.current.focus()
      }
    }, [settings.user.backupType])

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
      if (currentSetting) saveAppSetting(currentSetting, Number(backupInputRef.current.value))
    }

    const handleBackupBlur = () => {
      if (backupInputRef.current.value <= 0 || backupInputRef.current.value == '') {
        backupInputRef.current.value = 30
      }
      saveAppSetting(currentSetting, Number(backupInputRef.current.value))
    }

    const title =
      settings.user.backupType === 'days' ? t('Days of Backups') : t('Number of Backups')

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

  BackupOptions.propTypes = {
    settings: PropTypes.object.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      settings: selectors.appSettingsSelector(state.present),
    }))(BackupOptions)
  }

  throw new Error('Could not connect BackupOptions')
}

export default BackupOptionsConnector
