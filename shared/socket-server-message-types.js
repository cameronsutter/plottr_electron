export const PING = 'PING'
export const RM_RF = 'RM_RF'
export const SAVE_FILE = 'SAVE_FILE'
export const SAVE_OFFLINE_FILE = 'SAVE_OFFLINE_FILE'
export const FILE_BASENAME = 'FILE_BASENAME'
export const READ_FILE = 'READ_FILE'
export const BACKUP_FILE = 'BACKUP_FILE'
export const AUTO_SAVE_FILE = 'AUTO_SAVE_FILE'
export const SAVE_BACKUP_ERROR = 'SAVE_BACKUP_ERROR'
export const SAVE_BACKUP_SUCCESS = 'SAVE_BACKUP_SUCCESS'
export const AUTO_SAVE_ERROR = 'AUTO_SAVE_ERROR'
export const AUTO_SAVE_WORKED_THIS_TIME = 'AUTO_SAVE_WORKED_THIS_TIME'
export const AUTO_SAVE_BACKUP_ERROR = 'AUTO_SAVE_BACKUP_ERROR'
export const ENSURE_BACKUP_FULL_PATH = 'ENSURE_BACKUP_FULL_PATH'
export const ENSURE_BACKUP_TODAY_PATH = 'ENSURE_BACKUP_TODAY_PATH'
export const LOG_INFO = 'LOG_INFO'
export const LOG_WARN = 'LOG_WARN'
export const LOG_ERROR = 'LOG_ERROR'
export const FILE_EXISTS = 'FILE_EXISTS'
export const BACKUP_OFFLINE_BACKUP_FOR_RESUME = 'BACKUP_OFFLINE_BACKUP_FOR_RESUME'
export const READ_OFFLINE_FILES = 'READ_OFFLINE_FILES'
export const IS_TEMP_FILE = 'IS_TEMP_FILE'
export const SET_TEMPLATE = 'SET_TEMPLATE'
export const SET_CUSTOM_TEMPLATE = 'SET_CUSTOM_TEMPLATE'
export const DELETE_CUSTOM_TEMPLATE = 'DELETE_CUSTOM_TEMPLATE'
export const DEFAULT_BACKUP_LOCATION = 'DEFAULT_BACKUP_LOCATION'
export const ATTEMPT_TO_FETCH_TEMPLATES = 'ATTEMPT_TO_FETCH_TEMPLATES'
export const SAVE_AS_TEMP_FILE = 'SAVE_AS_TEMP_FILE'
export const REMOVE_FROM_KNOWN_FILES = 'REMOVE_FROM_KNOWN_FILES'
export const DELETE_KNOWN_FILE = 'DELETE_KNOWN_FILE'
export const UPDATE_KNOWN_FILE_NAME = 'UPDATE_KNOWN_FILE_NAME'
export const ADD_KNOWN_FILE = 'ADD_KNOWN_FILE'
export const ADD_KNOWN_FILE_WITH_FIX = 'ADD_KNOWN_FILE_WITH_FIX'
export const EDIT_KNOWN_FILE_PATH = 'EDIT_KNOWN_FILE_PATH'
export const UPDATE_LAST_OPENED_DATE = 'UPDATE_LAST_OPENED_DATE'
export const REMOVE_FROM_TEMP_FILES = 'REMOVE_FROM_TEMP_FILES'
export const SAVE_TO_TEMP_FILE = 'SAVE_TO_TEMP_FILE'

export const RM_RF_ERROR_REPLY = 'RM_RF_ERROR_REPLY'
export const SAVE_FILE_ERROR_REPLY = 'SAVE_FILE_ERROR_REPLY'
export const SAVE_OFFLINE_FILE_ERROR_REPLY = 'SAVE_OFFLINE_FILE_ERROR_REPLY'
export const FILE_BASENAME_ERROR_REPLY = 'FILE_BASENAME_ERROR_REPLY'
export const READ_FILE_ERROR_REPLY = 'READ_FILE_ERROR_REPLY'
export const BACKUP_FILE_ERROR_REPLY = 'BACKUP_FILE_ERROR_REPLY'
export const AUTO_SAVE_FILE_ERROR_REPLY = 'AUTO_SAVE_FILE_ERROR_REPLY'
export const ENSURE_BACKUP_FULL_PATH_ERROR_REPLY = 'ENSURE_BACKUP_FULL_PATH_ERROR_REPLY'
export const ENSURE_BACKUP_TODAY_PATH_ERROR_REPLY = 'ENSURE_BACKUP_TODAY_PATH_ERROR_REPLY'
export const FILE_EXISTS_ERROR_REPLY = 'FILE_EXISTS_ERROR_REPLY'
export const BACKUP_OFFLINE_BACKUP_FOR_RESUME_ERROR_REPLY =
  'BACKUP_OFFLINE_BACKUP_FOR_RESUME_ERROR_REPLY'
export const READ_OFFLINE_FILES_ERROR_REPLY = 'READ_OFFLINE_FILES_ERROR_REPLY'
export const IS_TEMP_FILE_ERROR_REPLY = 'IS_TEMP_FILE_ERROR_REPLY'
export const SET_TEMPLATE_ERROR_REPLY = 'SET_TEMPLATE_ERROR_REPLY'
export const SET_CUSTOM_TEMPLATE_ERROR_REPLY = 'SET_CUSTOM_TEMPLATE_ERROR_REPLY'
export const DELETE_CUSTOM_TEMPLATE_ERROR_REPLY = 'DELETE_CUSTOM_TEMPLATE_ERROR_REPLY'
export const DEFAULT_BACKUP_LOCATION_ERROR_REPLY = 'DEFAULT_BACKUP_LOCATION_ERROR_REPLY'
export const ATTEMPT_TO_FETCH_TEMPLATES_ERROR_REPLY = 'ATTEMPT_TO_FETCH_TEMPLATES_ERROR_REPLY'
export const SAVE_AS_TEMP_FILE_ERROR_REPLY = 'SAVE_AS_TEMP_FILE_ERROR_REPLY'
export const REMOVE_FROM_KNOWN_FILES_ERROR_REPLY = 'bREMOVE_FROM_KNOWN_FILES_ERROR_REPLY'
export const DELETE_KNOWN_FILE_ERROR_REPLY = 'DELETE_KNOWN_FILE_ERROR_REPLY'
export const UPDATE_KNOWN_FILE_NAME_ERROR_REPLY = 'UPDATE_KNOWN_FILE_NAME_ERROR_REPLY'
export const ADD_KNOWN_FILE_ERROR_REPLY = 'ADD_KNOWN_FILE_ERROR_REPLY'
export const ADD_KNOWN_FILE_WITH_FIX_ERROR_REPLY = 'ADD_KNOWN_FILE_WITH_FIX_ERROR_REPLY'
export const EDIT_KNOWN_FILE_PATH_ERROR_REPLY = 'EDIT_KNOWN_FILE_PATH_ERROR_REPLY'
export const UPDATE_LAST_OPENED_DATE_ERROR_REPLY = 'UPDATE_LAST_OPENED_DATE_ERROR_REPLY'
export const REMOVE_FROM_TEMP_FILES_ERROR_REPLY = 'REMOVE_FROM_TEMP_FILES_ERROR_REPLY'
export const SAVE_TO_TEMP_FILE_ERROR_REPLY = 'SAVE_TO_TEMP_FILE_ERROR_REPLY'

// File system APIs
export const BACKUP_BASE_PATH = 'BACKUP_BASE_PATH'
export const LISTEN_TO_TRIAL_CHANGES = 'LISTEN_TO_TRIAL_CHANGES'
export const CURRENT_TRIAL = 'CURRENT_TRIAL'
export const START_TRIAL = 'START_TRIAL'
export const EXTEND_TRIAL_WITH_RESET = 'EXTEND_TRIAL_WITH_RESET'
export const LISTEN_TO_LICENSE_CHANGES = 'LISTEN_TO_LICENSE_CHANGES'
export const CURRENT_LICENSE = 'CURRENT_LICENSE'
export const DELETE_LICENSE = 'DELETE_LICENSE'
export const SAVE_LICENSE_INFO = 'SAVE_LICENSE_INFO'
export const LISTEN_TO_KNOWN_FILES_CHANGES = 'LISTEN_TO_KNOWN_FILES_CHANGES'
export const CURRENT_KNOWN_FILES = 'CURRENT_KNOWN_FILES'
export const LISTEN_TO_TEMPLATES_CHANGES = 'LISTEN_TO_TEMPLATES_CHANGES'
export const CURRENT_TEMPLATES = 'CURRENT_TEMPLATES'
export const LISTEN_TO_CUSTOM_TEMPLATES_CHANGES = 'LISTEN_TO_CUSTOM_TEMPLATES_CHANGES'
export const CURRENT_CUSTOM_TEMPLATES = 'CURRENT_CUSTOM_TEMPLATES'
export const LISTEN_TO_TEMPLATE_MANIFEST_CHANGES = 'LISTEN_TO_TEMPLATE_MANIFEST_CHANGES'
export const CURRENT_TEMPLATE_MANIFEST = 'CURRENT_TEMPLATE_MANIFEST'
export const LISTEN_TO_EXPORT_CONFIG_SETTINGS_CHANGES = 'LISTEN_TO_EXPORT_CONFIG_SETTINGS_CHANGES'
export const CURRENT_EXPORT_CONFIG_SETTINGS = 'CURRENT_EXPORT_CONFIG_SETTINGS'
export const SAVE_EXPORT_CONFIG_SETTINGS = 'SAVE_EXPORT_CONFIG_SETTINGS'
export const LISTEN_TO_APP_SETTINGS_CHANGES = 'LISTEN_TO_APP_SETTINGS_CHANGES'
export const CURRENT_APP_SETTINGS = 'CURRENT_APP_SETTINGS'
export const SAVE_APP_SETTING = 'SAVE_APP_SETTING'
export const LISTEN_TO_USER_SETTINGS_CHANGES = 'LISTEN_TO_USER_SETTINGS_CHANGES'
export const CURRENT_USER_SETTINGS = 'CURRENT_USER_SETTINGS'
export const LISTEN_TO_BACKUPS_CHANGES = 'LISTEN_TO_BACKUPS_CHANGES'
export const CURRENT_BACKUPS = 'CURRENT_BACKUPS'
export const CUSTOM_TEMPLATES_PATH = 'CUSTOM_TEMPLATES_PATH'
export const OFFLINE_FILE_PATH = 'OFFLINE_FILE_PATH'
export const COPY_FILE = 'COPY_FILE'

// File system unsubscribe types
export const LISTEN_TO_TRIAL_CHANGES_UNSUBSCRIBE = 'LISTEN_TO_TRIAL_CHANGES_UNSUBSCRRIBE'
export const LISTEN_TO_LICENSE_CHANGES_UNSUBSCRIBE = 'LISTEN_TO_LICENSE_CHANGES_UNSUBSCRRIBE'
export const LISTEN_TO_KNOWN_FILES_CHANGES_UNSUBSCRIBE =
  'LISTEN_TO_KNOWN_FILES_CHANGES_UNSUBSCRRIBE'
export const LISTEN_TO_TEMPLATES_CHANGES_UNSUBSCRIBE = 'LISTEN_TO_TEMPLATES_CHANGES_UNSUBSCRRIBE'
export const LISTEN_TO_CUSTOM_TEMPLATES_CHANGES_UNSUBSCRIBE =
  'LISTEN_TO_CUSTOM_TEMPLATES_CHANGES_UNSUBSCRRIBE'
export const LISTEN_TO_TEMPLATE_MANIFEST_CHANGES_UNSUBSCRIBE =
  'LISTEN_TO_TEMPLATE_MANIFEST_CHANGES_UNSUBSCRRIBE'
export const LISTEN_TO_EXPORT_CONFIG_SETTINGS_CHANGES_UNSUBSCRIBE =
  'LISTEN_TO_EXPORT_CONFIG_SETTINGS_CHANGES_UNSUBSCRRIBE'
export const LISTEN_TO_APP_SETTINGS_CHANGES_UNSUBSCRIBE =
  'LISTEN_TO_APP_SETTINGS_CHANGES_UNSUBSCRRIBE'
export const LISTEN_TO_USER_SETTINGS_CHANGES_UNSUBSCRIBE =
  'LISTEN_TO_USER_SETTINGS_CHANGES_UNSUBSCRRIBE'
export const LISTEN_TO_BACKUPS_CHANGES_UNSUBSCRIBE = 'LISTEN_TO_BACKUPS_CHANGES_UNSUBSCRRIBE'

// File system error reply types
export const CUSTOM_TEMPLATES_PATH_ERROR_REPLY = 'CUSTOM_TEMPLATES_PATH_ERROR_REPLY'
export const BACKUP_BASE_PATH_ERROR_REPLY = 'BACKUP_BASE_PATH_ERROR_REPLY'
export const CURRENT_TRIAL_ERROR_REPLY = 'CURRENT_TRIAL_ERROR_REPLY'
export const START_TRIAL_ERROR_REPLY = 'START_TRIAL_ERROR_REPLY'
export const EXTEND_TRIAL_WITH_RESET_ERROR_REPLY = 'EXTEND_TRIAL_WITH_RESET_ERROR_REPLY'
export const CURRENT_LICENSE_ERROR_REPLY = 'CURRENT_LICENSE_ERROR_REPLY'
export const DELETE_LICENSE_ERROR_REPLY = 'DELETE_LICENSE_ERROR_REPLY'
export const SAVE_LICENSE_INFO_ERROR_REPLY = 'SAVE_LICENSE_INFO_ERROR_REPLY'
export const CURRENT_KNOWN_FILES_ERROR_REPLY = 'CURRENT_KNOWN_FILES_ERROR_REPLY'
export const CURRENT_TEMPLATES_ERROR_REPLY = 'CURRENT_TEMPLATES_ERROR_REPLY'
export const CURRENT_CUSTOM_TEMPLATES_ERROR_REPLY = 'CURRENT_CUSTOM_TEMPLATES_ERROR_REPLY'
export const CURRENT_TEMPLATE_MANIFEST_ERROR_REPLY = 'CURRENT_TEMPLATE_MANIFEST_ERROR_REPLY'
export const CURRENT_EXPORT_CONFIG_SETTINGS_ERROR_REPLY =
  'CURRENT_EXPORT_CONFIG_SETTINGS_ERROR_REPLY'
export const SAVE_EXPORT_CONFIG_SETTINGS_ERROR_REPLY = 'SAVE_EXPORT_CONFIG_SETTINGS_ERROR_REPLY'
export const CURRENT_APP_SETTINGS_ERROR_REPLY = 'CURRENT_APP_SETTINGS_ERROR_REPLY'
export const SAVE_APP_SETTING_ERROR_REPLY = 'SAVE_APP_SETTING_ERROR_REPLY'
export const CURRENT_USER_SETTINGS_ERROR_REPLY = 'CURRENT_USER_SETTINGS_ERROR_REPLY'
export const CURRENT_BACKUPS_ERROR_REPLY = 'CURRENT_BACKUPS_ERROR_REPLY'
export const OFFLINE_FILE_PATH_ERROR_REPLY = 'OFFLINE_FILE_PATH_ERROR_REPLY'
export const COPY_FILE_PATH_ERROR_REPLY = 'COPY_FILE_PATH_ERROR_REPLY'

// Status
export const BUSY = 'BUSY'
export const DONE = 'DONE'
