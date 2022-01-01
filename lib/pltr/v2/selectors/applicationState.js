export const fileListLoadedSelector = (state) => state.applicationState.project.fileListLoaded
export const fileListIsLoadingSelector = (state) => state.applicationState.project.loadingFileList

export const applicationSettingsAreLoadedSelector = (state) =>
  state.applicationState.settings.settingsLoaded
