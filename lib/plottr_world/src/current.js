const current = (theWorld) => ({
  license: {
    currentLicense: theWorld.license.currentLicense,
    currentTrial: theWorld.license.currentTrial,
  },
  session: {
    listenForSessionChange: theWorld.session.listenForSessionChange,
  },
  files: {
    currentlyKnownFiles: theWorld.files.currentKnownFiles,
  },
  backups: {
    currentBackups: theWorld.backups.currentBackups,
  },
  templates: {
    currentTemplates: theWorld.templates.currentTemplates,
    currentCustomTemplates: theWorld.templates.currentCustomTemplates,
    currentTemplateManifest: theWorld.templates.currentTemplateManifest,
  },
  settings: {
    currentAppSettings: theWorld.settings.currentAppSettings,
    currentUserSettings: theWorld.settings.currentUserSettings,
    currentExportConfigSettings: theWorld.settings.currentExportConfigSettings,
  },
})

export default current
