import React, { useState, useEffect } from 'react'
import electron, { ipcRenderer, shell } from 'electron'
import { t, setupI18n } from 'plottr_locales'
import SETTINGS from '../../../common/utils/settings'
import { useSettingsInfo } from '../../../common/utils/store_hooks'
import { Switch, LanguagePicker } from 'connected-components'
import { FormControl, FormGroup, ControlLabel, HelpBlock, Button } from 'react-bootstrap'
import { BACKUP_BASE_PATH } from '../../../common/utils/config_paths'
import DarkOptionsSelect from './DarkOptionsSelect'
import TemplateFetcher from '../../utils/template_fetcher'

export default function OptionsHome(props) {
  const [settings, _, saveSetting] = useSettingsInfo()
  const [backupType, setBackupType] = useState('days')

  const [backupLocation, setBackupLocation] = useState(settings.user.backupLocation)
  if (!backupLocation || backupLocation == 'default') setBackupLocation(BACKUP_BASE_PATH)

  const [loading, setLoading] = useState(false)
  const [preloading, setPreloading] = useState(false)

  const [loop, setLoop] = useState()
  const [message, setMessage] = useState(false)

  useEffect(() => {
    setLoop(
      setInterval(() => {
        if (preloading && loading) {
          setMessage(true)
        }
      }, 5000)
    )
    return function cleanup() {
      clearInterval(loop)
    }
  }, [preloading, loading])

  // const onChangeBackupLocation = (event) => {
  //   let file = event.target.files[0]
  //   if (file) {
  //     let folder = file.path.split('/')
  //     let folderPath = folder.slice(0, folder.length - 1).join('/')
  //     setBackupLocation(folderPath)
  //     saveSetting('user.backupLocation', folderPath)
  //   }
  //   setLoading(false)
  //   setPreloading(false)
  // }

  const displayBackupOption = () => {
    return (
      <div className="backup-type">
        <ControlLabel>{t('Number of Backups to Keep')}</ControlLabel>
        <FormControl
          disabled
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
    <div
      className="dashboard__options"
      onFocus={() => {
        if (preloading) setLoading(true)
      }}
      onBlur={() => {
        if (!preloading) setLoading(false)
      }}
    >
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
          <LanguagePicker
            onSelectLanguage={(newLanguage) => {
              SETTINGS.set('locale', newLanguage)
              setupI18n(SETTINGS, { electron })
              ipcRenderer.send('pls-update-language', newLanguage)
            }}
          />
        </div>
        <hr />
        <h4>{t('Beta')}</h4>
        <div className="dashboard__options__item">
          <h4>{t('Act Structure')}</h4>
          <Switch
            isOn={!!settings.user.beatHierarchy}
            handleToggle={toggleBeatHierarchy}
            labelText={t('Organize your scene cards into Chapters and Acts')}
          />
          <br />
          <p>
            {t('To give feedback on this feature, please visit:')}
            <br />
            <Button bsStyle="link" onClick={() => shell.openExternal('https://plottr.com/beta/')}>
              {t('plottr.com/beta')}
            </Button>
          </p>
        </div>
        <hr />
        <h1 className="secondary-text">{t('Coming Soon!')}</h1>
        <div className="dashboard__options__item disabled">
          <h4>{t('Auto-Save')}</h4>
          <Switch
            disabled
            isOn={!!settings.user.autoSave || true}
            handleToggle={() => saveSetting('user.autoSave', !settings.user.autoSave)}
            labelText={t('By default, use auto-save for projects')}
          />
        </div>
        <div className="dashboard__options__item disabled">
          <h4>{t('Backup Location')}</h4>
          <FormGroup controlId="backupLocation">
            <ControlLabel>{t('Folder where backups are stored')}</ControlLabel>
            <FormControl type="text" value={backupLocation} onChange={() => {}} disabled />
          </FormGroup>
        </div>
        <div className="dashboard__options__item disabled">
          <h4>{t('Days of Backup')}</h4>
          <FormGroup controlId="backupDays">
            <select onChange={(event) => setBackupType(event.target.value)} disabled>
              <option value="days">{t('Days of Backups')}</option>
              <option value="number">{t('Number of Backups')}</option>
            </select>
            {displayBackupOption()}
          </FormGroup>
        </div>
      </div>
    </div>
  )
}
