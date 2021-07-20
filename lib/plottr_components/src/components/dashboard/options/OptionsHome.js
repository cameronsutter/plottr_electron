import React from 'react'
import { t, setupI18n } from 'plottr_locales'
import { HelpBlock, Button } from 'react-bootstrap'
import Switch from '../../Switch'
import UnconnectedLanguagePicker from '../../LanguagePicker'
import UnconnectedDarkOptionsSelect from './DarkOptionsSelect'
import UnconnectedBackupOptions from './BackupOptions'

const OptionsHomeConnector = (connector) => {
  const {
    platform: {
      template: { TemplateFetcher },
      electron,
      openExternal,
      useSettingsInfo,
      defaultBackupLocation,
      showOpenDialogSync,
      updateLanguage,
      updateBeatHierarchyFlag,
    },
  } = connector
  const SETTINGS = connector.platform.settings

  const LanguagePicker = UnconnectedLanguagePicker(connector)
  const DarkOptionsSelect = UnconnectedDarkOptionsSelect(connector)
  const BackupOptions = UnconnectedBackupOptions(connector)

  const OptionsHome = (props) => {
    const [settings, _, saveSetting] = useSettingsInfo()

    const onChangeBackupLocation = () => {
      const title = t('Choose your backup location')
      const properties = ['openDirectory']
      const files = showOpenDialogSync({ title, properties })
      if (files && files.length) {
        let folderPath = files[0]
        saveSetting('user.backupLocation', folderPath)
      }
    }

    const toggleBeatHierarchy = () => {
      const newValue = !settings.user.beatHierarchy
      saveSetting('user.beatHierarchy', newValue)
      updateBeatHierarchyFlag(newValue)
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
                updateLanguage(newLanguage)
              }}
            />
          </div>
          <div className="dashboard__options__item">
            <h4>{t('Backup Location')}</h4>
            <HelpBlock>{t('Folder where backups are stored')}</HelpBlock>
            <p>
              {settings.user.backupLocation === 'default'
                ? defaultBackupLocation
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
            <p className="text-warning">
              {t("Don't forget to make a backup of your files first.")}
            </p>
            <p>
              {t('To give feedback on this feature, please visit:')}
              <br />
              <Button bsStyle="link" onClick={() => openExternal('https://plottr.com/beta/')}>
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

  return OptionsHome
}

export default OptionsHomeConnector
