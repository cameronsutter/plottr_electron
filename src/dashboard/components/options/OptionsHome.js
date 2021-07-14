import React from 'react'
import electron, { ipcRenderer, shell, remote } from 'electron'
import { t, setupI18n } from 'plottr_locales'
import SETTINGS from '../../../common/utils/settings'
import { useSettingsInfo } from '../../../common/utils/store_hooks'
import { Switch, LanguagePicker } from 'connected-components'
import { HelpBlock, Button } from 'react-bootstrap'
import { BACKUP_BASE_PATH } from '../../../common/utils/config_paths'
import DarkOptionsSelect from './DarkOptionsSelect'
import TemplateFetcher from '../../utils/template_fetcher'
import BackupOptions from './BackupOptions'

const { dialog } = remote

const win = remote.getCurrentWindow()

export default function OptionsHome(props) {
  const [settings, _, saveSetting] = useSettingsInfo()

  const onChangeBackupLocation = () => {
    const title = t('Choose your backup location')
    const properties = ['openDirectory']
    const files = dialog.showOpenDialogSync(win, { title, properties })
    if (files && files.length) {
      let folderPath = files[0]
      saveSetting('user.backupLocation', folderPath)
    }
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
          <LanguagePicker
            onSelectLanguage={(newLanguage) => {
              SETTINGS.set('locale', newLanguage)
              setupI18n(SETTINGS, { electron })
              ipcRenderer.send('pls-update-language', newLanguage)
            }}
          />
        </div>
        <div className="dashboard__options__item">
          <h4>{t('Backup Location')}</h4>
          <HelpBlock>{t('Folder where backups are stored')}</HelpBlock>
          <p>
            {settings.user.backupLocation === 'default'
              ? BACKUP_BASE_PATH
              : settings.user.backupLocation}
          </p>
          <Button bsSize="small" onClick={onChangeBackupLocation}>
            {t('Choose...')}
          </Button>
        </div>
        <div className="dashboard__options__item">
          <BackupOptions />
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
          <p className="text-warning">{t("Don't forget to make a backup of your files first.")}</p>
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
      </div>
    </div>
  )
}
