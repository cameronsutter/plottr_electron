import {
  START_CREATING_CLOUD_FILE,
  FINISH_CREATING_CLOUD_FILE,
  START_UPLOADING_FILE_TO_CLOUD,
  FINISH_UPLOADING_FILE_TO_CLOUD,
  START_LOADING_FILE,
  FINISH_LOADING_FILE,
  START_RENAMING_FILE,
  FINISH_RENAMING_FILE,
  START_LOGGING_IN,
  FINISH_LOGGING_IN,
  START_LOADING_A_LICENSE_TYPE,
  FINISH_LOADING_A_LICENSE_TYPE,
  START_LOADING_A_SETTINGS_TYPE,
  FINISH_LOADING_A_SETTINGS_TYPE,
  START_CHECKING_SESSION,
  FINISH_CHECKING_SESSION,
  START_LOADING_FILE_LIST,
  FINISH_LOADING_FILE_LIST,
  START_DELETING_FILE,
  FINISH_DELETING_FILE,
} from '../constants/ActionTypes'

const INITIAL_STATE = {
  project: {
    loadingFileList: false,
    fileListLoaded: false,
  },
  file: {
    creatingCloudFile: false,
    uploadingFileToCloud: false,
    loadingFile: false,
    fileLoaded: false,
    renamingFile: false,
    deletingFile: false,
  },
  session: {
    loggingIn: false,
    checkingSession: false,
    sessionChecked: false,
  },
  license: {
    loadingTrial: false,
    trialLoaded: false,
    loadingLicense: false,
    licenseLoaded: false,
    checkingProSubscription: false,
    proSubscriptionLoaded: false,
  },
  settings: {
    loadingSettings: false,
    settingsLoaded: false,
    loadingExportConfig: false,
    exportConfigLoaded: false,
  },
}

const startLoadingLicenseType = (licenseState, licenseType) => {
  switch (licenseType) {
    case 'trial': {
      return {
        ...licenseState,
        loadingTrial: true,
      }
    }
    case 'license': {
      return {
        ...licenseState,
        loadingLicense: true,
      }
    }
    case 'proSubscription': {
      return {
        ...licenseState,
        checkingProSubscription: true,
      }
    }
    default: {
      return licenseState
    }
  }
}

const finishLoadingLicenseType = (licenseState, licenseType) => {
  switch (licenseType) {
    case 'trial': {
      return {
        ...licenseState,
        loadingTrial: false,
      }
    }
    case 'license': {
      return {
        ...licenseState,
        loadingLicense: false,
      }
    }
    case 'proSubscription': {
      return {
        ...licenseState,
        checkingProSubscription: false,
      }
    }
    default: {
      return licenseState
    }
  }
}

const startLoadingSettingsType = (settingsState, settingsType) => {
  switch (settingsType) {
    case 'exportConfig': {
      return {
        ...settingsState,
        loadingExportConfig: true,
      }
    }
    case 'settings': {
      return {
        ...settingsState,
        loadingSettings: true,
      }
    }
    default: {
      return settingsState
    }
  }
}

const finishLoadingSettingsType = (settingsState, settingsType) => {
  switch (settingsType) {
    case 'exportConfig': {
      return {
        ...settingsState,
        loadingExportConfig: false,
        exportConfigLoaded: true,
      }
    }
    case 'settings': {
      return {
        ...settingsState,
        loadingSettings: false,
        settingsLoaded: true,
      }
    }
    default: {
      return settingsState
    }
  }
}

const applicationStateReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case START_LOADING_FILE_LIST: {
      return {
        ...state,
        project: {
          ...state.project,
          loadingFileList: true,
        },
      }
    }
    case FINISH_LOADING_FILE_LIST: {
      return {
        ...state,
        project: {
          ...state.project,
          fileListLoaded: true,
          loadingFileList: false,
        },
      }
    }
    case START_CREATING_CLOUD_FILE: {
      return {
        ...state,
        file: {
          ...state.file,
          creatingCloudFile: true,
        },
      }
    }
    case FINISH_CREATING_CLOUD_FILE: {
      return {
        ...state,
        file: {
          ...state.file,
          creatingCloudFile: false,
        },
      }
    }
    case START_UPLOADING_FILE_TO_CLOUD: {
      return {
        ...state,
        file: {
          ...state.file,
          uploadingFileToCloud: true,
        },
      }
    }
    case FINISH_UPLOADING_FILE_TO_CLOUD: {
      return {
        ...state,
        file: {
          ...state.file,
          uploadingFileToCloud: false,
        },
      }
    }
    case START_LOADING_FILE: {
      return {
        ...state,
        file: {
          ...state.file,
          loadingFile: true,
          fileLoaded: false,
        },
      }
    }
    case FINISH_LOADING_FILE: {
      return {
        ...state,
        file: {
          ...state.file,
          loadingFile: false,
          fileLoaded: true,
        },
      }
    }
    case START_RENAMING_FILE: {
      return {
        ...state,
        file: {
          ...state.file,
          renamingFile: true,
        },
      }
    }
    case FINISH_RENAMING_FILE: {
      return {
        ...state,
        file: {
          ...state.file,
          renamingFile: false,
        },
      }
    }
    case START_DELETING_FILE: {
      return {
        ...state,
        file: {
          deletingFile: true,
        },
      }
    }
    case FINISH_DELETING_FILE: {
      return {
        ...state,
        file: {
          deletingFile: false,
        },
      }
    }
    case START_LOGGING_IN: {
      return {
        ...state,
        session: {
          ...state.session,
          loggingIn: true,
        },
      }
    }
    case FINISH_LOGGING_IN: {
      return {
        ...state,
        session: {
          ...state.session,
          loggingIn: false,
        },
      }
    }
    case START_CHECKING_SESSION: {
      return {
        ...state,
        session: {
          ...state.session,
          checkingSession: true,
        },
      }
    }
    case FINISH_CHECKING_SESSION: {
      return {
        ...state,
        session: {
          ...state.session,
          checkingSession: false,
          sessionChecked: true,
        },
      }
    }
    case START_LOADING_A_LICENSE_TYPE: {
      return {
        ...state,
        license: {
          ...startLoadingLicenseType(state.license, action.licenseType),
        },
      }
    }
    case FINISH_LOADING_A_LICENSE_TYPE: {
      return {
        ...state,
        license: {
          ...finishLoadingLicenseType(state.license, action.licenseType),
        },
      }
    }
    case START_LOADING_A_SETTINGS_TYPE: {
      return {
        ...state,
        settings: {
          ...startLoadingSettingsType(state.settings, action.settingsType),
        },
      }
    }
    case FINISH_LOADING_A_SETTINGS_TYPE: {
      return {
        ...state,
        settings: {
          ...finishLoadingSettingsType(state.settings, action.settingsType),
        },
      }
    }
    default: {
      return state
    }
  }
}

export default applicationStateReducer