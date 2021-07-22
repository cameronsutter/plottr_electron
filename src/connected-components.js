import electron, { remote, shell, ipcRenderer } from 'electron'
import path from 'path'
import { connections } from 'plottr_components'
import { readFileSync } from 'fs'
import { machineIdSync } from 'node-machine-id'

import { BACKUP_BASE_PATH, TEMP_FILES_PATH } from './common/utils/config_paths'
import { useExportConfigInfo } from './common/utils/store_hooks'
import askToExport from './common/exporter/start_export'
import export_config from './common/exporter/default_config'
import {
  listTemplates,
  listCustomTemplates,
  getTemplateById,
  deleteTemplate,
  editTemplateDetails,
} from './common/utils/templates'
import log from 'electron-log'
import { createErrorReport } from './common/utils/full_error_report'
import SETTINGS from './common/utils/settings'
import USER from './common/utils/user_info'
import { is } from 'electron-util'
import MPQ from './common/utils/MPQ'
import { useLicenseInfo, licenseStore } from './common/utils/store_hooks'
import { useTrialStatus } from './common/licensing/trial_manager'
import { checkForActiveLicense } from './common/licensing/check_license'
import { verifyLicense } from './common/licensing/verify_license'
import { trial90days } from './common/licensing/special_codes'
import {
  createFromSnowflake,
  createNew,
  openExistingFile,
  openKnownFile,
} from './dashboard/utils/window_manager'
import { doesFileExist, useSortedKnownFiles } from './dashboard/utils/files'
import {
  deleteKnownFile,
  editKnownFilePath,
  removeFromKnownFiles,
} from './common/utils/known_files'
import { saveFile } from './common/utils/files'
import { useCustomTemplatesInfo } from './common/utils/store_hooks'
import { useFilteredSortedTemplates } from './dashboard/utils/templates'
import { useBackupFolders } from './dashboard/utils/backups'
import { useSettingsInfo } from './common/utils/store_hooks'
import { handleCustomerServiceCode } from './common/utils/customer_service_codes'
import TemplateFetcher from './dashboard/utils/template_fetcher'

const win = remote.getCurrentWindow()
const { app, dialog } = remote
const version = app.getVersion()

const platform = {
  electron,
  appVersion: version,
  defaultBackupLocation: BACKUP_BASE_PATH,
  setDarkMode: (value) => {
    ipcRenderer.send('pls-set-dark-setting', value)
  },
  file: {
    createNew,
    openExistingFile,
    doesFileExist,
    useSortedKnownFiles,
    isTempFile: (filePath) => filePath.includes(TEMP_FILES_PATH),
    pathSep: path.sep,
    basename: path.basename,
    openKnownFile,
    deleteKnownFile,
    editKnownFilePath,
    removeFromKnownFiles,
    saveFile,
    readFileSync,
    moveItemToTrash: shell.moveItemToTrash,
    createFromSnowflake,
    joinPath: path.join,
  },
  update: {
    quitToInstall: () => {
      ipcRenderer.send('pls-quit-and-install')
    },
    downloadUpdate: () => {
      ipcRenderer.send('pls-download-update')
    },
    checkForUpdates: () => {
      ipcRenderer.send('pls-check-for-updates')
    },
    onUpdateError: (cb) => {
      ipcRenderer.on('updater-error', cb)
    },
    onUpdaterUpdateAvailable: (cb) => {
      ipcRenderer.on('updater-update-available', cb)
    },
    onUpdaterUpdateNotAvailable: (cb) => {
      ipcRenderer.on('updater-update-not-available', cb)
    },
    onUpdaterDownloadProgress: (cb) => {
      ipcRenderer.on('updater-download-progress', cb)
    },
    onUpdatorUpdateDownloaded: (cb) => {
      ipcRenderer.on('updater-update-downloaded', cb)
    },
  },
  updateLanguage: (newLanguage) => {
    ipcRenderer.send('pls-update-language', newLanguage)
  },
  updateBeatHierarchyFlag: (newValue) => {
    ipcRenderer.send('pls-update-beat-hierarchy-flag', newValue)
  },
  license: {
    useLicenseInfo,
    checkForActiveLicense,
    useTrialStatus,
    licenseStore,
    verifyLicense,
    trial90days,
  },
  reloadMenu: () => {
    ipcRenderer.send('pls-reload-menu')
  },
  checkForUpdates: () => {
    ipcRenderer.send('pls-check-for-updates')
  },
  template: {
    TemplateFetcher,
    listTemplates,
    listCustomTemplates,
    getTemplateById,
    deleteTemplate,
    editTemplateDetails,
    startSaveAsTemplate: (itemType) => {
      const win = remote.getCurrentWindow()
      ipcRenderer.sendTo(win.webContents.id, 'save-as-template-start', itemType) // sends this message to this same process
    },
    saveTemplate: (payload) => {
      const win = remote.getCurrentWindow()
      ipcRenderer.sendTo(win.webContents.id, 'save-custom-template', payload)
    },
    useFilteredSortedTemplates,
    useCustomTemplatesInfo,
  },
  settings: SETTINGS,
  useSettingsInfo,
  user: USER,
  os: is.windows ? 'windows' : is.macos ? 'macos' : is.linux ? 'linux' : 'unknown',
  isDevelopment: is.development,
  isWindows: is.windows,
  isMacOS: is.macos,
  openExternal: shell.openExternal,
  createErrorReport,
  handleCustomerServiceCode,
  log,
  dialog,
  showSaveDialogSync: (options) => dialog.showSaveDialogSync(win, options),
  showOpenDialogSync: (options) => dialog.showOpenDialogSync(win, options),
  node: {
    env: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  },
  rollbar: {
    rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN || '',
    platform: process.platform,
  },
  export: {
    askToExport,
    export_config,
  },
  store: {
    useExportConfigInfo,
  },
  useBackupFolders,
  moveFromTemp: () => {
    const win = remote.getCurrentWindow()
    ipcRenderer.sendTo(win.webContents.id, 'move-from-temp')
  },
  showItemInFolder: (fileName) => {
    shell.showItemInFolder(fileName)
  },
  tempFilesPath: TEMP_FILES_PATH,
  mpq: MPQ,
  rootElementSelectors: ['#react-root', '#dashboard__react__root'],
  machineIdSync,
}

const components = connections.pltr(platform)

export const OverlayTrigger = components.OverlayTrigger
export const DeleteConfirmModal = components.DeleteConfirmModal
export const ColorPickerColor = components.ColorPickerColor
export const ItemsManagerModal = components.ItemsManagerModal
export const ListItem = components.ListItem
export const PlottrModal = components.PlottrModal
export const EditAttribute = components.EditAttribute
export const RichText = components.RichText
export const editorRegistry = components.editorRegistry
export const normalize = components.normalize
export const Image = components.Image
export const ImagePicker = components.ImagePicker
export const MiniColorPicker = components.MiniColorPicker
export const Spinner = components.Spinner
export const FunSpinner = components.FunSpinner
export const InputModal = components.InputModal
export const ColorPicker = components.ColorPicker
export const Switch = components.Switch
export const CardTemplateDetails = components.CardTemplateDetails
export const PlotlineTemplateDetails = components.PlotlineTemplateDetails
export const TemplateCreate = components.TemplateCreate
export const TemplateEdit = components.TemplateEdit
export const TemplatePicker = components.TemplatePicker
export const Beamer = components.Beamer
export const LanguagePicker = components.LanguagePicker
export const CategoryPicker = components.CategoryPicker
export const CharacterCategoriesModal = components.CharacterCategoriesModal
export const CharacterDetails = components.CharacterDetails
export const CharacterEditDetails = components.CharacterEditDetails
export const CharacterItem = components.CharacterItem
export const CharacterListView = components.CharacterListView
export const CustomAttrFilterList = components.CustomAttrFilterList
export const BookFilterList = components.BookFilterList
export const CharacterCategoryFilterList = components.CharacterCategoryFilterList
export const CharactersFilterList = components.CharactersFilterList
export const PlacesFilterList = components.PlacesFilterList
export const TagFilterList = components.TagFilterList
export const GenericFilterList = components.GenericFilterList
export const SortList = components.SortList
export const CharacterView = components.CharacterView
export const BookSelectList = components.BookSelectList
export const ErrorBoundary = components.ErrorBoundary
export const DashboardErrorBoundary = components.DashboardErrorBoundary
export const SelectList = components.SelectList
export const TagLabel = components.TagLabel
export const CustomAttributeModal = components.CustomAttributeModal
export const SubNav = components.SubNav
export const ProjectTemplateDetails = components.ProjectTemplateDetails
export const CharacterTemplateDetails = components.CharacterTemplateDetails
export const ActsConfigModal = components.ActsConfigModal
export const AskToSaveModal = components.AskToSaveModal
export const FilterList = components.FilterList
export const TagView = components.TagView
export const TagListView = components.TagListView
export const ExportDialog = components.ExportDialog
export const ExportNavItem = components.ExportNavItem
export const NoteListView = components.NoteListView
export const OutlineView = components.OutlineView
export const PlaceListView = components.PlaceListView
export const BookList = components.BookList
export const EditSeries = components.EditSeries
export const FileLocation = components.FileLocation
export const BookChooser = components.BookChooser
export const TimelineWrapper = components.TimelineWrapper
export const DashboardBody = components.DashboardBody
export const DashboardNavigation = components.DashboardNavigation
