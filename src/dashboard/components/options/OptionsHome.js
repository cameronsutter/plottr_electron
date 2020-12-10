import React, { useState } from 'react'
import t from 'format-message'
import { useSettingsInfo } from '../../../common/utils/store_hooks'
import Switch from '../../../common/components/Switch'
import { FormControl, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap'
import { BACKUP_BASE_PATH } from '../../../common/utils/config_paths'

export default function OptionsHome (props) {
  const [settings, settingsSize, saveSetting] = useSettingsInfo()

  let backupLocation = settings.user.backupLocation
  if (!backupLocation || backupLocation == 'default') backupLocation = BACKUP_BASE_PATH

  return <div className='dashboard__options'>
    <h1>{t('Configuration Options')}</h1>
    <div>
      <div className='dashboard__options__item'>
        <h4>{t('Save Backups')}</h4>
        <Switch
          isOn={!!settings.backup}
          handleToggle={() => saveSetting('backup', !settings.backup)}
          labelText={t('Automatically save daily backups')}
        />
      </div>
      <div className='dashboard__options__item'>
        <h4>{t('Update Automatically')}</h4>
        <Switch
          isOn={!!settings.user.autoUpdate}
          handleToggle={() => saveSetting('user.autoUpdate', !settings.user.autoUpdate)}
          labelText={t('Download updates automatically')}
        />
      </div>
      <hr/>
      <h1 className='secondary-text'>{t('Coming Soon!')}</h1>
      <div className='dashboard__options__item disabled'>
        <h4>{t('Auto-save')}</h4>
        <Switch
          disabled
          isOn={!!settings.user.autoSave}
          handleToggle={() => saveSetting('user.autoSave', !settings.user.autoSave)}
          labelText={t('By default, use auto-save for projects')}
        />
      </div>
      <div className='dashboard__options__item disabled'>
        <h4>{t('Force Dark Mode')}</h4>
        <Switch
          disabled
          isOn={!!settings.user.darkModeAlways}
          handleToggle={() => saveSetting('user.darkModeAlways', !settings.user.darkModeAlways)}
          labelText={t("Override your computer's setting and always use dark mode")}
        />
      </div>
      <div className='dashboard__options__item disabled'>
        <h4>{t('Days of Backup')}</h4>
        <FormGroup controlId='backupDays'>
          <ControlLabel>{t('Number of Days of Rolling Backups to Keep')}</ControlLabel>
          <FormControl
            disabled
            type='number'
            value={settings.user.backupDays || 30}
            onChange={(event) => saveSetting('user.backupDays', Number(event.target.value))}
          />
          <HelpBlock>{t('Backups older than this will be erased')}</HelpBlock>
        </FormGroup>
      </div>
      <div className='dashboard__options__item disabled'>
        <h4>{t('Backup Location')}</h4>
        <FormGroup controlId='backupLocation'>
          <ControlLabel>{t('Folder where backups are stored')}</ControlLabel>
          <FormControl
            disabled
            type='text'
            value={backupLocation}
            onChange={(event) => saveSetting('user.backupLocation', event.target.value)}
          />
        </FormGroup>
      </div>
    </div>
  </div>
}