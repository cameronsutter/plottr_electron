import React from 'react'
import { t, setupI18n } from 'plottr_locales'
import { HelpBlock, Button, Tabs, Tab } from 'react-bootstrap'
import Switch from '../../Switch'
import UnconnectedLanguagePicker from '../../LanguagePicker'
import UnconnectedDarkOptionsSelect from './DarkOptionsSelect'
import UnconnectedBackupOptions from './BackupOptions'
import { checkDependencies } from '../../checkDependencies'

const OptionsHomeConnector = (connector) => {
  const {
    platform: {
      electron,
      openExternal,
      useSettingsInfo,
      defaultBackupLocation,
      showOpenDialogSync,
      updateLanguage,
      updateBeatHierarchyFlag,
      os,
      license: { hasPro },
    },
  } = connector
  const SETTINGS = connector.platform.settings
  checkDependencies({
    openExternal,
    useSettingsInfo,
    defaultBackupLocation,
    showOpenDialogSync,
    updateLanguage,
    updateBeatHierarchyFlag,
    os,
    SETTINGS,
    hasPro,
  })

  const LanguagePicker = UnconnectedLanguagePicker(connector)
  const DarkOptionsSelect = UnconnectedDarkOptionsSelect(connector)
  const BackupOptions = UnconnectedBackupOptions(connector)

  const osIsUnknown = os === 'unknown'

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
    }

    // show if:
    // - not web
    // - not Pro, unless Pro & localBackups
    const showBackupLocation = () => {
      return (!osIsUnknown && !hasPro()) || (!osIsUnknown && settings.user.localBackups)
    }

    return (
      <div className="dashboard__options">
        <h1>{t('Settings')}</h1>
        <div>
          <Tabs defaultActiveKey={1} id="settings-tabs">
            <Tab eventKey={1} title={t('General')}>
              {!osIsUnknown ? (
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
              ) : null}
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
            </Tab>
            <Tab eventKey={3} title={t('Backups')}>
              <div className="dashboard__options__item">
                <h4>{t('Save Backups')}</h4>
                <Switch
                  isOn={!!settings.backup}
                  handleToggle={() => saveSetting('backup', !settings.backup)}
                  labelText={t('Automatically save daily backups')}
                />
              </div>
              {!osIsUnknown ? (
                <>
                  <div className="dashboard__options__item">
                    <h4>{t('Backup Location')}</h4>
                    <HelpBlock className="dashboard__options-item-help">
                      {t('Folder where backups are stored')}
                    </HelpBlock>
                    <p>
                      <Button onClick={onChangeBackupLocation}>{t('Choose...')}</Button>
                      {'  '}
                      {!settings.user.backupLocation || settings.user.backupLocation === 'default'
                        ? defaultBackupLocation
                        : settings.user.backupLocation}
                    </p>
                    {settings.user.backupLocation !== 'default' ? (
                      <Button onClick={() => saveSetting('user.backupLocation', 'default')}>
                        {t('Restore Default')}
                      </Button>
                    ) : null}
                  </div>
                  <div className="dashboard__options__item">
                    <BackupOptions />
                  </div>
                  <hr />
                  <h1 className="secondary-text">{t('Coming Soon!')}</h1>
                  <div className="dashboard__options__item disabled">
                    <h4>{t('Also save backups on this device')}</h4>
                    <Switch
                      disabled
                      isOn={!!settings.user.localBackups}
                      handleToggle={() =>
                        saveSetting('user.localBackups', !settings.user.localBackups)
                      }
                      labelText={t('Save backups to this device as well as in the cloud')}
                    />
                  </div>
                </>
              ) : null}
            </Tab>
            <Tab eventKey={4} title={t('Beta')}>
              <div className="dashboard__options__item">
                <h4>{t('Act Structure')}</h4>
                <Switch
                  isOn={!!settings.user.beatHierarchy}
                  handleToggle={toggleBeatHierarchy}
                  labelText={t('Organize your scene cards into Chapters and Acts')}
                />
                <br />
                {!osIsUnknown ? (
                  <p className="text-warning">
                    {t("Don't forget to make a backup of your files first.")}
                  </p>
                ) : null}
                <p>
                  {t('To give feedback on this feature, please visit:')}
                  <br />
                  <Button bsStyle="link" onClick={() => openExternal('https://plottr.com/beta/')}>
                    {t('plottr.com/beta')}
                  </Button>
                </p>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    )
  }

  return OptionsHome
}

export default OptionsHomeConnector
