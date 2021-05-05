// Connections
import connections from '../connections'

// Templates
import CardTemplateDetails from './templates/CardTemplateDetails'
import PlotlineTemplateDetails from './templates/PlotlineTemplateDetails'
import TemplateCreate from './templates/TemplateCreate'
import ProjectTemplateDetails from './templates/ProjectTemplateDetails'
import CharacterTemplateDetails from './templates/CharacterTemplateDetails'
import TemplateEdit from './templates/TemplateEdit'
import TemplatePicker from './templates/TemplatePicker'

// Dialogs
import DeleteConfirmModal from './dialogs/DeleteConfirmModal'
import CustomAttributeModal from './dialogs/CustomAttributeModal'
import ItemsManagerModal, { ListItem } from './dialogs/ItemsManagerModal'
import InputModal from './dialogs/InputModal'
import ActsConfigModal from './dialogs/ActsConfigModal'
import AskToSaveModal from './dialogs/AskToSaveModal'

// Containers
import ErrorBoundary from './containers/ErrorBoundary'
import DashboardErrorBoundary from './containers/DashboardErrorBoundary'
import SubNav from './containers/SubNav'

// Filter List
import BookFilterList from './filterLists/BookFilterList'
import CharacterCategoryFilterList from './filterLists/CharacterCategoryFilterList'
import CharactersFilterList from './filterLists/CharactersFilterList'
import PlacesFilterList from './filterLists/PlacesFilterList'
import TagFilterList from './filterLists/TagFilterList'
import GenericFilterList from './filterLists/GenericFilterList'
import CardColorFilterList from './filterLists/CardColorFilterList'
import FilterList from './filterLists/FilterList'

// RCE
import RichText from './rce/RichText'
import editorRegistry from './rce/editor-registry'

// Images
import Image from './images/Image'
import ImagePicker from './images/ImagePicker'

// Characters
import CharacterCategoriesModal from './characters/CharacterCategoriesModal'
import CharacterDetails from './characters/CharacterDetails'
import CharacterEditDetails from './characters/CharacterEditDetails'
import CharacterItem from './characters/CharacterItem'
import CharacterListView from './characters/CharacterListView'
import CharacterView from './characters/CharacterView'

// Project
import BookSelectList from './project/BookSelectList'
import BookList from './project/BookList'
import EditSeries from './project/EditSeries'
import FileLocation from './project/FileLocation'
import BookChooser from './project/BookChooser'

// Tag
import TagView from './tag/TagView'
import TagListView from './tag/TagListView'

// Export
import ExportDialog from './export/ExportDialog'
import ExportNavItem from './export/ExportNavItem'

// Notes
import NoteListView from './notes/NoteListView'

// Outline
import OutlineView from './outline/OutlineView'

// Places
import PlaceListView from './places/PlaceListView'

// Timeline
import TimelineWrapper from './timeline/TimelineWrapper'

// Root components
import ColorPickerColor from './ColorPickerColor'
import CustomAttrFilterList from './CustomAttrFilterList'
import PlottrModal from './PlottrModal'
import EditAttribute from './EditAttribute'
import MiniColorPicker from './MiniColorPicker'
import { Spinner, FunSpinner } from './Spinner'
import ColorPicker from './ColorPicker'
import Switch from './Switch'
import Beamer from './Beamer'
import LanguagePicker from './LanguagePicker'
import CategoryPicker from './CategoryPicker'
import SortList from './SortList'
import SelectList from './SelectList'
import TagLabel from './TagLabel'

export {
  DeleteConfirmModal,
  ColorPickerColor,
  ItemsManagerModal,
  ListItem,
  PlottrModal,
  EditAttribute,
  FilterList,
  RichText,
  editorRegistry,
  Image,
  ImagePicker,
  MiniColorPicker,
  Spinner,
  FunSpinner,
  InputModal,
  ColorPicker,
  Switch,
  CardTemplateDetails,
  PlotlineTemplateDetails,
  TemplateCreate,
  TemplateEdit,
  TemplatePicker,
  Beamer,
  LanguagePicker,
  CategoryPicker,
  CharacterCategoriesModal,
  CharacterDetails,
  CharacterEditDetails,
  CharacterItem,
  CharacterListView,
  CustomAttrFilterList,
  BookFilterList,
  CharacterCategoryFilterList,
  CharactersFilterList,
  PlacesFilterList,
  TagFilterList,
  GenericFilterList,
  CardColorFilterList,
  SortList,
  CharacterView,
  BookSelectList,
  BookList,
  EditSeries,
  FileLocation,
  BookChooser,
  TagView,
  TagListView,
  ExportDialog,
  ExportNavItem,
  NoteListView,
  OutlineView,
  PlaceListView,
  TimelineWrapper,
  ActsConfigModal,
  AskToSaveModal,
  ErrorBoundary,
  DashboardErrorBoundary,
  SelectList,
  TagLabel,
  CustomAttributeModal,
  SubNav,
  ProjectTemplateDetails,
  CharacterTemplateDetails,
  connections,
}
