import {
  SET_EXPORT_SETTINGS,
  SET_USER_SETTINGS,
  SET_APP_SETTINGS,
  SET_DARK_MODE,
} from '../constants/ActionTypes'

const INITIAL_STATE = {
  exportSettings: {
    saveSettings: true,
    savedType: 'word',
    scrivener: {
      general: {},
      outline: {
        export: true,
        columnOrRow: 'column',
        sceneCards: true,
        plotlineInTitle: true,
        attachments: true,
        description: true,
        descriptionHeading: true,
        where: 'synopsis',
        customAttributes: true,
        templates: true,
        filter: null,
      },
      characters: {
        export: true,
        heading: true,
        description: true,
        descriptionHeading: true,
        attachments: true,
        notesHeading: true,
        notes: true,
        customAttributes: true,
        templates: true,
        tags: true,
        categoryHeading: true,
        category: true,
      },
      places: {
        export: true,
        heading: true,
        description: true,
        descriptionHeading: true,
        attachments: true,
        notesHeading: true,
        notes: true,
        customAttributes: true,
        tags: true,
      },
      notes: {
        export: true,
        heading: true,
        attachments: true,
        content: true,
      },
    },
    word: {
      general: {
        titlePage: true,
      },
      outline: {
        export: true,
        columnOrRow: 'column',
        heading: true,
        sceneCards: true,
        plotlineInTitle: true,
        attachments: true,
        description: true,
        customAttributes: true,
        templates: true,
        filter: null,
      },
      characters: {
        export: true,
        heading: true,
        images: true,
        descriptionHeading: true,
        description: true,
        attachments: true,
        notesHeading: true,
        notes: true,
        customAttributes: true,
        templates: true,
        categoryHeading: true,
        category: true,
      },
      places: {
        export: true,
        heading: true,
        images: true,
        descriptionHeading: true,
        description: true,
        attachments: true,
        notesHeading: true,
        notes: true,
        customAttributes: true,
      },
      notes: {
        export: true,
        heading: true,
        images: true,
        attachments: true,
        content: true,
      },
    },
  },
  appSettings: {
    showTheTour: false,
    backup: true,
    allowPrerelease: false,
    forceDevTools: false,
    trialMode: false,
    canGetUpdates: true,
    isInGracePeriod: false,
    gracePeriodEnd: 0,
    canEdit: true,
    canExport: true,
    user: {
      autoDownloadUpdate: true,
      autoSave: true,
      backupDays: null,
      backupLocation: 'default',
      dark: 'dark',
      numberOfBackups: null,
      openDashboardFirst: true,
      backupType: 'never-delete',
      localBackups: false,
      email: 'test@test.com',
      enableOfflineMode: false,
      useSpellcheck: true,
      font: 'Forum',
      fontSize: 20,
    },
  },
  userSettings: {
    // TODO: these seem to be the same as license data based on the
    // path of the USER store(!?)
  },
}

const settingsReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_EXPORT_SETTINGS: {
      return {
        ...state,
        exportSettings: action.exportSettings,
      }
    }
    case SET_USER_SETTINGS: {
      return {
        ...state,
        userSettings: action.userSettings,
      }
    }
    case SET_APP_SETTINGS: {
      return {
        ...state,
        appSettings: action.appSettings,
      }
    }
    case SET_DARK_MODE: {
      return {
        ...state,
        appSettings: {
          ...state.appSettings,
          dark: action.value,
        },
      }
    }
    default: {
      return state
    }
  }
}

export default settingsReducer
