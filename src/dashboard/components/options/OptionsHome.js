import React, { useState } from 'react'
import { ipcRenderer } from 'electron'
import { t } from 'plottr_locales'
import { useSettingsInfo } from '../../../common/utils/store_hooks'
import Switch from '../../../common/components/Switch'
import { FormControl, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap'
import { BACKUP_BASE_PATH } from '../../../common/utils/config_paths'
import LanguagePicker from '../../../common/components/LanguagePicker'
import DarkOptionsSelect from './DarkOptionsSelect'
import TemplateFetcher from '../../utils/template_fetcher'

export default function OptionsHome(props) {
  const [settings, _, saveSetting] = useSettingsInfo()
  const [backupType, setBackupType] = useState('days')

  let backupLocation = settings.user.backupLocation
  if (!backupLocation || backupLocation == 'default') backupLocation = BACKUP_BASE_PATH

  const displayBackupOption = () => {
    return (
      <div className="backup-type">
        <ControlLabel>{t('Number of Backups to Keep')}</ControlLabel>
        <FormControl
          type="number"
          value={backupType === 'number' ? settings.user.numberOfBackups : settings.user.backupDays}
          onChange={(event) =>
            saveSetting(
              backupType === 'number' ? 'user.numberOfBackups' : 'user.backupDays',
              Number(event.target.value)
            )
          }
        />
        <HelpBlock>{t('Backups beyond this will be erased')}</HelpBlock>
      </div>
    )
  }

  const toggleBeatHierarchy = () => {
    const newValue = !settings.user.beatHierarchy
    saveSetting('user.beatHierarchy', newValue)
    ipcRenderer.send('pls-update-beat-hierarchy-flag', newValue)
    // Templates are different for the beat hierarchy feature.
    // FIXME: when we un-beta this feature then this can be removed safely.
    // Also See: TemplateFetcher.manifestReq()
    TemplateFetcher.fetch(true)
  }

  return (
    <div className="dashboard__options">
      <h1>{t('Settings')}</h1>
      <div>
        <div className="dashboard__options__item">
          <h4>{t('Save Backups')}</h4>
          <Switch
            isOn={!!settings.backup}
            handleToggle={() => saveSetting('backup', !settings.backup)}
            labelText={t('Automatically save daily backups')}
          />
        </div>
        <div className="dashboard__options__item">
          <h4>{t('Update Automatically')}</h4>
          <Switch
            isOn={!!settings.user.autoDownloadUpdate}
            handleToggle={() =>
              saveSetting('user.autoDownloadUpdate', !settings.user.autoDownloadUpdate)
            }
            labelText={t('Download updates automatically')}
          />
        </div>
        <div className="dashboard__options__item">
          <h4>{t('Appearance: Dark/Light')}</h4>
          <DarkOptionsSelect />
        </div>
        <div className="dashboard__options__item">
          <h4>{t('Language')}</h4>
          <LanguagePicker />
        </div>
        <div className="dashboard__options__item">
          <h4>{t('Backup Storage Type')}</h4>
          <hr />
          <h1 className="dashboard__options">{t('Beta')}</h1>
          <div className="dashboard__options__item">
            <h4>{t('Act Structure')}</h4>
            <Switch
              isOn={!!settings.user.beatHierarchy}
              handleToggle={toggleBeatHierarchy}
              labelText={t('Organize your scene cards into Chapters and Acts')}
            />
          </div>
          <hr />
          <h1 className="secondary-text">{t('Coming Soon!')}</h1>
          <div className="dashboard__options__item disabled">
            <h4>{t('Auto-save')}</h4>
            <Switch
              disabled
              isOn={!!settings.user.autoSave || true}
              handleToggle={() => saveSetting('user.autoSave', !settings.user.autoSave)}
              labelText={t('By default, use auto-save for projects')}
            />
          </div>
          <div className="dashboard__options__item disabled">
            <h4>{t('Days of Backup')}</h4>
            <FormGroup controlId="backupDays">
              <select onChange={(event) => setBackupType(event.target.value)}>
                <option value="days">{t('Days of Backups')}</option>
                <option value="number">{t('Number of Backups')}</option>
              </select>
              {displayBackupOption()}
            </FormGroup>
          </div>
          <div className="dashboard__options__item">
            <h4>{t('Backup Location')}</h4>
            <FormGroup controlId="backupLocation">
              <ControlLabel>{t('Folder where backups are stored')}</ControlLabel>
              <FormControl
                type="text"
                value={backupLocation}
                onChange={(event) => saveSetting('user.backupLocation', event.target.value)}
              />
            </FormGroup>
          </div>
          <hr />
          <h1 className="secondary-text">{t('Coming Soon!')}</h1>
          <div className="dashboard__options__item disabled">
            <h4>{t('Auto-save')}</h4>
            <Switch
              disabled
              isOn={!!settings.user.autoSave || true}
              handleToggle={() => saveSetting('user.autoSave', !settings.user.autoSave)}
              labelText={t('By default, use auto-save for projects')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
