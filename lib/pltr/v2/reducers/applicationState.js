import { finishCheckingFileToLoad } from '../actions/applicationState'
import {
  START_CREATING_CLOUD_FILE,
  FINISH_CREATING_CLOUD_FILE,
  START_UPLOADING_FILE_TO_CLOUD,
  FINISH_UPLOADING_FILE_TO_CLOUD,
  START_LOADING_FILE,
  FINISH_LOADING_FILE,
  ERROR_LOADING_FILE,
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
  START_CHECKING_FILE_TO_LOAD,
  FINISH_CHECKING_FILE_TO_LOAD,
  ADVANCE_PRO_ONBOARDING,
  START_ONBOARDING,
  FINISH_ONBOARDING,
  START_SAVING_FILE_AS,
  FINISH_SAVING_FILE_AS,
  START_ONBOARDING_FROM_ROOT,
  START_IMPORTING_SCRIVENER,
  FINISH_IMPORTING_SCRIVENER,
  PROMPT_TO_UPLOAD_FILE,
  DISMISS_PROMPT_TO_UPLOAD_FILE,
  REQUEST_CHECK_FOR_UPDATE,
  PROCESS_RESPONSE_TO_REQUEST_UPDATE,
  DISMISS_UPDATE_NOTIFIER,
  SET_UPDATE_DOWNLOAD_PROGRESS,
  AUTO_CHECK_FOR_UPDATES,
  BUSY_WITH_WORK_THAT_PREVENTS_QUITTING,
  DONE_WITH_WORK_THAT_PREVENTS_QUITTING,
  CLEAR_ERROR_LOADING_FILE,
} from '../constants/ActionTypes'

const INITIAL_STATE = {
  project: {
    loadingFileList: false,
    fileListLoaded: false,
    importingNewProject: false,
  },
  file: {
    filePathToUpload: null,
    checkingFileToLoad: false,
    checkedFileToLoad: false,
    creatingCloudFile: false,
    uploadingFileToCloud: false,
    loadingFile: false,
    fileLoaded: false,
    renamingFile: false,
    deletingFile: false,
    savingFileAs: false,
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
    proSubscriptionChecked: false,
  },
  settings: {
    loadingSettings: false,
    settingsLoaded: false,
    loadingExportConfig: false,
    exportConfigLoaded: false,
  },
  proOnboarding: {
    isOnboarding: false,
    isOnboardingFromRoot: false,
    onboardingStep: null,
  },
  update: {
    requestedCheck: false,
    shouldCheck: true,
    checking: false,
    available: false,
    percentDownloaded: 0,
    error: null,
    info: null,
    notifierHidden: true,
  },
  work: {
    busy: false,
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
        trialLoaded: true,
      }
    }
    case 'license': {
      return {
        ...licenseState,
        loadingLicense: false,
        licenseLoaded: true,
      }
    }
    case 'proSubscription': {
      return {
        ...licenseState,
        checkingProSubscription: false,
        proSubscriptionChecked: true,
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

function applicationStateReducer(state = INITIAL_STATE, action) {
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
    case START_CHECKING_FILE_TO_LOAD: {
      return {
        ...state,
        file: {
          ...state.file,
          checkingFileToLoad: true,
        },
      }
    }
    case FINISH_CHECKING_FILE_TO_LOAD: {
      return {
        ...state,
        file: {
          ...state.file,
          checkingFileToLoad: false,
          checkedFileToLoad: true,
        },
      }
    }
    case PROMPT_TO_UPLOAD_FILE: {
      return {
        ...state,
        file: {
          ...state.file,
          filePathToUpload: action.filePath,
        },
      }
    }
    case DISMISS_PROMPT_TO_UPLOAD_FILE: {
      return applicationStateReducer(
        {
          ...state,
          file: {
            ...state.file,
            filePathToUpload: null,
          },
        },
        finishCheckingFileToLoad()
      )
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
    case ERROR_LOADING_FILE: {
      return {
        ...state,
        file: {
          ...state.file,
          errorLoadingFile: true,
          errorIsUpdateError: action.errorIsUpdateError,
          loadingFile: true,
          fileLoaded: false,
        },
      }
    }
    case CLEAR_ERROR_LOADING_FILE: {
      return {
        ...state,
        file: {
          ...state.file,
          errorLoadingFile: false,
          loadingFile: false,
          fileLoaded: false,
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
          ...state.file,
          deletingFile: true,
        },
      }
    }
    case FINISH_DELETING_FILE: {
      return {
        ...state,
        file: {
          ...state.file,
          deletingFile: false,
        },
      }
    }
    case START_SAVING_FILE_AS: {
      return {
        ...state,
        file: {
          ...state.file,
          savingFileAs: true,
        },
      }
    }
    case FINISH_SAVING_FILE_AS: {
      return {
        ...state,
        file: {
          ...state.file,
          savingFileAs: false,
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
    case ADVANCE_PRO_ONBOARDING: {
      if (!state.proOnboarding.isOnboarding && !state.proOnboarding.isOnboardingFromRoot) {
        return state
      }
      const onboardingStep = state.proOnboarding.onboardingStep
        ? state.proOnboarding.onboardingStep
        : 0
      return {
        ...state,
        proOnboarding: {
          ...state.proOnboarding,
          onboardingStep: onboardingStep + 1,
        },
      }
    }
    case START_ONBOARDING: {
      if (state.proOnboarding.isOnboarding || state.proOnboarding.isOnboardingFromRoot) {
        return state
      }
      return {
        ...state,
        proOnboarding: {
          ...state.proOnboarding,
          isOnboarding: true,
          onboardingStep: 0,
        },
        license: {
          ...state.license,
          checkingProSubscription: false,
          proSubscriptionChecked: false,
        },
        session: {
          loggingIn: false,
        },
      }
    }
    case START_ONBOARDING_FROM_ROOT: {
      if (state.proOnboarding.isOnboardingFromRoot || state.proOnboarding.isOnboardingFromRoot) {
        return state
      }
      return {
        ...state,
        proOnboarding: {
          ...state.proOnboarding,
          isOnboardingFromRoot: true,
          onboardingStep: 0,
        },
        license: {
          ...state.license,
          checkingProSubscription: false,
          proSubscriptionChecked: false,
        },
      }
    }
    default: {
      return state
    }
    case FINISH_ONBOARDING: {
      if (!state.proOnboarding.isOnboarding && !state.proOnboarding.isOnboardingFromRoot) {
        return state
      }
      return {
        ...state,
        proOnboarding: {
          ...state.proOnboarding,
          isOnboarding: false,
          isOnboardingFromRoot: false,
        },
      }
    }

    case START_IMPORTING_SCRIVENER: {
      return {
        ...state,
        project: {
          ...state.project,
          isImportingNewProject: true,
        },
      }
    }

    case FINISH_IMPORTING_SCRIVENER: {
      return {
        ...state,
        project: {
          ...state.project,
          isImportingNewProject: false,
        },
      }
    }
    case REQUEST_CHECK_FOR_UPDATE: {
      return {
        ...state,
        update: {
          ...state.update,
          requestedCheck: true,
          checking: true,
          shouldCheck: false,
          notifierHidden: false,
        },
      }
    }
    case AUTO_CHECK_FOR_UPDATES: {
      return {
        ...state,
        update: {
          ...state.update,
          checking: true,
          shouldCheck: false,
          notifierHidden: false,
        },
      }
    }
    case PROCESS_RESPONSE_TO_REQUEST_UPDATE: {
      const { available, error, info } = action

      return {
        ...state,
        update: {
          ...state.update,
          checking: false,
          available,
          error,
          info,
        },
      }
    }
    case DISMISS_UPDATE_NOTIFIER: {
      return {
        ...state,
        update: {
          ...state.update,
          notifierHidden: true,
          error: null,
          info: null,
        },
      }
    }
    case SET_UPDATE_DOWNLOAD_PROGRESS: {
      const { percent } = action
      if (percent === state.update.percentDownloaded) {
        return state
      }

      return {
        ...state,
        update: {
          ...state.update,
          percentDownloaded: percent,
          downloadInProgress: percent < 100,
        },
      }
    }
    case BUSY_WITH_WORK_THAT_PREVENTS_QUITTING: {
      return {
        ...state,
        work: {
          busy: true,
        },
      }
    }
    case DONE_WITH_WORK_THAT_PREVENTS_QUITTING: {
      return {
        ...state,
        work: {
          busy: false,
        },
      }
    }
  }
}

export default applicationStateReducer
