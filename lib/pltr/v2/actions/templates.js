import {
  SET_TEMPLATES,
  SET_CUSTOM_TEMPLATES,
  SET_TEMPLATE_MANIFEST,
} from '../constants/ActionTypes'

export const setTemplates = (templates) => ({
  type: SET_TEMPLATES,
  templates,
})

export const setCustomTemplates = (customTemplates) => ({
  type: SET_CUSTOM_TEMPLATES,
  customTemplates,
})

export const setTemplateManifest = (templateManifest) => ({
  type: SET_TEMPLATE_MANIFEST,
  templateManifest,
})
