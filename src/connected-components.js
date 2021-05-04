import electron, { remote, shell, ipcRenderer } from 'electron'
import { connections } from 'plottr_components'

import { TEMP_FILES_PATH } from './common/utils/config_paths'
import { useExportConfigInfo } from './common/utils/store_hooks'
import askToExport from './common/exporter/start_export'
import export_config from './common/exporter/default_config'
import {
  listTemplates,
  listCustomTemplates,
  deleteTemplate,
  editTemplateDetails,
} from './common/utils/templates'
import log from 'electron-log'
import { createErrorReport } from './common/utils/full_error_report'
import SETTINGS from './common/utils/settings'
import USER from './common/utils/user_info'
import { is } from 'electron-util'
import MPQ from './common/utils/MPQ'

const { app, dialog } = remote
const version = app.getVersion()

const platform = {
  electron,
  appVersion: version,
  template: {
    listTemplates,
    listCustomTemplates,
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
  },
  settings: SETTINGS,
  user: USER,
  os: is.windows ? 'windows' : is.macos ? 'macos' : is.linux ? 'linux' : 'unknown',
  isDevelopment: is.development,
  isWindows: is.windows,
  isMacOS: is.macos,
  openExternal: shell.openExternal,
  createErrorReport,
  log,
  dialog,
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
  moveFromTemp: () => {
    const win = remote.getCurrentWindow()
    ipcRenderer.sendTo(win.webContents.id, 'move-from-temp')
  },
  showItemInFolder: (fileName) => {
    shell.showItemInFolder(fileName)
  },
  tempFilesPath: TEMP_FILES_PATH,
  mpq: MPQ,
}

const components = connections.pltr(platform)

export const DeleteConfirmModal = components.DeleteConfirmModal
export const ColorPickerColor = components.ColorPickerColor
export const ItemsManagerModal = components.ItemsManagerModal
export const ListItem = components.ListItem
export const PlottrModal = components.PlottrModal
export const EditAttribute = components.EditAttribute
export const RichText = components.RichText
export const editorRegistry = components.editorRegistry
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
