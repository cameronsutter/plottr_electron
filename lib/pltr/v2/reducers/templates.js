import {
  SET_TEMPLATES,
  SET_CUSTOM_TEMPLATES,
  SET_TEMPLATE_MANIFEST,
} from '../constants/ActionTypes'

const INITIAL_STATE = {
  templates: {},
  customTemplates: {},
  templateManifest: {},
}

const templatesReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SET_TEMPLATES: {
      return {
        ...state,
        templates: action.templates,
      }
    }
    case SET_CUSTOM_TEMPLATES: {
      return {
        ...state,
        customTemplates: action.customTemplates,
      }
    }
    case SET_TEMPLATE_MANIFEST: {
      return {
        ...state,
        templateManifest: action.templateManifest,
      }
    }
    default: {
      return state
    }
  }
}

export default templatesReducer
