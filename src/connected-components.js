import electron, { remote, shell, ipcRenderer } from 'electron'
import path from 'path'
import { ActionCreators } from 'redux-undo'
import { connections } from 'plottr_components'
import { readFileSync } from 'fs'
import { machineIdSync } from 'node-machine-id'

import { t } from 'plottr_locales'
import {
  publishRCEOperations,
  fetchRCEOperations,
  listenForChangesToEditor,
  deleteChangeSignal,
  deleteOldChanges,
  imagePublicURL,
  isStorageURL,
  saveImageToStorageBlob as saveImageToStorageBlobInFirebase,
  saveImageToStorageFromURL as saveImageToStorageFromURLInFirebase,
  deleteFile,
  startUI,
  firebaseUI,
  onSessionChange,
  fetchFiles,
  logOut,
  saveCustomTemplate,
  currentUser,
  listenForRCELock,
  lockRCE,
  releaseRCELock,
} from 'wired-up-firebase'
import { BACKUP_BASE_PATH, TEMP_FILES_PATH } from './common/utils/config_paths'
import {
  useExportConfigInfo,
  useTemplatesInfo,
  useLicenseInfo,
  licenseStore,
  useCustomTemplatesInfo,
  useSettingsInfo,
} from './common/utils/store_hooks'
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
import { createFullErrorReport } from './common/utils/full_error_report'
import { createErrorReport } from './common/utils/error_reporter'
import SETTINGS from './common/utils/settings'
import USER from './common/utils/user_info'
import { is } from 'electron-util'
import MPQ from './common/utils/MPQ'
import { useTrialStatus } from './common/licensing/trial_manager'
import { checkForActiveLicense } from './common/licensing/check_license'
import { verifyLicense } from './common/licensing/verify_license'
import { checkForPro } from './common/licensing/check_pro'
import { trial90days } from './common/licensing/special_codes'
import { openExistingFile as _openExistingFile } from './dashboard/utils/window_manager'
import { doesFileExist, useSortedKnownFiles, removeFromKnownFiles } from './dashboard/utils/files'
import { useFilteredSortedTemplates } from './dashboard/utils/templates'
import { useBackupFolders } from './dashboard/utils/backups'
import { handleCustomerServiceCode } from './common/utils/customer_service_codes'
import TemplateFetcher from './dashboard/utils/template_fetcher'
import { store } from './app/store/configureStore'
import { messageRenameFile, newFile, uploadExisting, openFile } from './files'
import extractImages from './common/extract_images'
import { useProLicenseInfo } from './common/utils/checkPro'
import { resizeImage } from './common/resizeImage'

const win = remote.getCurrentWindow()
const { app, dialog } = remote
const version = app.getVersion()

const filters = [{ name: 'Plottr file', extensions: ['pltr'] }]

const showSaveDialogSync = (options) => dialog.showSaveDialogSync(win, options)

const editKnownFilePath = (oldFilePath, newFilePath) => {
  ipcRenderer.send('edit-known-file-path', oldFilePath, newFilePath)
}

const saveFile = (filePath, file) => {
  ipcRenderer.send('save-file', filePath, file)
}

const moveItemToTrash = shell.moveItemToTrash

const platform = {
  undo: () => {
    store.dispatch(ActionCreators.undo())
  },
  redo: () => {
    store.dispatch(ActionCreators.redo())
  },
  electron,
  appVersion: version,
  defaultBackupLocation: BACKUP_BASE_PATH,
  setDarkMode: (value) => {
    ipcRenderer.send('pls-set-dark-setting', value)
  },
  file: {
    createNew: (template) => {
      const state = store.getState()
      const {
        client: { emailAddress, userId, clientId },
        project: { fileList },
      } = state.present
      if (userId) {
        newFile(emailAddress, userId, fileList, state, clientId, template, openFile)
      } else {
        ipcRenderer.send('create-new-file', template)
      }
    },
    openExistingFile: () => {
      const state = store.getState()
      const {
        client: { userId, emailAddress },
      } = state.present
      _openExistingFile(!!userId, userId, emailAddress)
    },
    doesFileExist,
    useSortedKnownFiles,
    isTempFile: (filePath) => filePath.includes(TEMP_FILES_PATH),
    pathSep: path.sep,
    basename: path.basename,
    openKnownFile: openFile,
    deleteKnownFile: (id, path) => {
      const {
        present: {
          client: { userId, clientId },
        },
      } = store.getState()
      const isOnCloud = path.startsWith('plottr://')
      if (isOnCloud) {
        deleteFile(id, userId, clientId)
      } else {
        ipcRenderer.send('delete-known-file', id, path, userId, clientId)
      }
    },
    editKnownFilePath,
    renameFile: (filePath) => {
      if (filePath.startsWith('plottr://')) {
        const {
          present: {
            project: { fileList },
          },
        } = store.getState()
        const fileId = fileList.find(({ filePath }) => filePath === filePath)?.id
        if (fileId) messageRenameFile(fileId)
        return
      }
      const fileName = showSaveDialogSync({
        filters,
        title: t('Give this file a new name'),
        defaultPath: filePath,
      })
      if (fileName) {
        try {
          let newFilePath = fileName.includes('.pltr') ? fileName : `${fileName}.pltr`
          editKnownFilePath(filePath, newFilePath)
          const contents = JSON.parse(readFileSync(filePath, 'utf-8'))
          saveFile(newFilePath, contents)
          moveItemToTrash(filePath, true)
        } catch (error) {
          log.error(error)
          dialog.showErrorBox(t('Error'), t('There was an error doing that. Try again'))
        }
      }
    },
    removeFromKnownFiles,
    saveFile,
    readFileSync,
    moveItemToTrash,
    createFromSnowflake: (importedPath) => {
      ipcRenderer.send('create-from-snowflake', importedPath)
    },
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
    deregisterUpdateListeners: () => {
      ipcRenderer.removeAllListeners('updater-error')
      ipcRenderer.removeAllListeners('updater-update-available')
      ipcRenderer.removeAllListeners('updater-update-not-available')
      ipcRenderer.removeAllListeners('updater-download-progress')
      ipcRenderer.removeAllListeners('updater-update-downloaded')
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
    checkForPro,
    hasPro: () => SETTINGS.get('user.id') || false,
  },
  reloadMenu: () => {
    ipcRenderer.send('pls-reload-menu')
  },
  template: {
    TemplateFetcher,
    listTemplates,
    listCustomTemplates,
    getTemplateById,
    deleteTemplate: (templateId) => {
      const state = store.getState()
      const {
        client: { userId },
      } = state.present
      deleteTemplate(templateId, userId)
    },
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
    useTemplatesInfo,
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
  createFullErrorReport,
  handleCustomerServiceCode,
  log,
  dialog,
  showSaveDialogSync,
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
  templatesDisabled: false,
  exportDisabled: false,
  publishRCEOperations,
  fetchRCEOperations,
  listenForChangesToEditor,
  deleteChangeSignal,
  deleteOldChanges,
  listenForRCELock,
  lockRCE,
  releaseRCELock,
  machineIdSync,
  extractImages,
  useProLicenseInfo,
  firebase: {
    startUI,
    firebaseUI,
    onSessionChange,
    currentUser,
    fetchFiles,
    logOut,
    saveCustomTemplate,
    uploadExisting,
  },
  storage: {
    imagePublicURL,
    isStorageURL,
    resolveToPublicUrl: (storageUrl) => {
      if (!storageUrl) return null
      return imagePublicURL(storageUrl)
    },
    saveImageToStorageBlob: (blob, name) => {
      const state = store.getState()
      const {
        client: { userId },
      } = state.present
      return saveImageToStorageBlobInFirebase(userId, name, blob)
    },
    saveImageToStorageFromURL: (url, name) => {
      const state = store.getState()
      const {
        client: { userId },
      } = state.present
      return saveImageToStorageFromURLInFirebase(userId, name, url)
    },
    resizeImage: resizeImage,
  },
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
export const ActsHelpModal = components.ActsHelpModal
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
export const FirebaseLogin = components.FirebaseLogin
