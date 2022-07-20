import {
  saveCustomTemplate as saveCustomTemplateToFirstore,
  deleteCustomTemplate as deleteCustomTemplateOnFirestore,
  editCustomTemplate as editCustomTemplateOnFirestore,
} from 'wired-up-firebase'

const CUSTOM_TEMPLATE_PREFIX = 'custom_template__'
const TEMPLATE_PREFIX = 'templates__'
const TEMPLATE_MANIFEST_KEY = 'template_manifest'

const safeParse = (string) => {
  try {
    return JSON.parse(string)
  } catch (error) {
    console.error(`Error parsing ${string} from JSON`, error)
    return null
  }
}

const isTemplateKey = (key) => {
  return key.startsWith(TEMPLATE_PREFIX)
}

export const allTemplates = () => {
  return Object.entries(window.sessionStorage).reduce((acc, [key, templateString]) => {
    if (isTemplateKey(key)) {
      const template = safeParse(templateString)
      if (template) return [...acc, template]
    }
    return acc
  }, [])
}

export const getTemplateById = (id) => {
  return allTemplates().find((template) => template.id === id)
}

export const getCustomTemplateById = (id) => {
  return allCustomTemplates().find((template) => template.id === id)
}

const customTemplateKey = (templateId) => {
  return `${CUSTOM_TEMPLATE_PREFIX}${templateId}`
}

const isCustomTemplateKey = (key) => {
  return key.startsWith(CUSTOM_TEMPLATE_PREFIX)
}

export const allCustomTemplates = () => {
  return Object.entries(window.sessionStorage).reduce((acc, [key, templateString]) => {
    if (isCustomTemplateKey(key)) {
      const template = safeParse(templateString)
      if (template) return [...acc, template]
    }
    return acc
  }, [])
}

export const saveCustomTemplateToStorage = (template) => {
  window.sessionStorage.setItem(customTemplateKey(template.id), JSON.stringify(template))
}

export const saveCustomTemplate = (userId, template) => {
  saveCustomTemplateToFirstore(userId, template).then(() => {
    saveCustomTemplateToStorage(template)
  })
}

export const saveCustomTemplatesToStorage = (templates) => {
  templates.forEach(saveCustomTemplateToStorage)
}

export const deleteCustomTemplate = (templateId, userId) => {
  window.sessionStorage.removeItem(customTemplateKey(templateId))
  deleteCustomTemplateOnFirestore(userId, templateId)
}

export const editCustomTemplate = (templateId, template) => {
  return editCustomTemplateOnFirestore(templateId, template)
}

export const startSaveAsTemplate = (type) => {
  const saveEvent = new Event('start-save-as-template', { bubbles: true, cancelable: false })
  saveEvent.templateType = type
  document.dispatchEvent(saveEvent)
}

export const messageToSaveNewTemplate = (payload) => {
  const saveEvent = new Event('save-template', { bubbles: true, cancelable: false })
  saveEvent.payload = payload
  document.dispatchEvent(saveEvent)
}

export const messageToEditTemplate = (_templateId, template) => {
  const editEvent = new Event('edit-template', { bubbles: true, cancelable: false })
  editEvent.template = template
  document.dispatchEvent(editEvent)
}

export const messageToDeleteTemplate = (templateId) => {
  const deleteEvent = new Event('delete-template', { bubbles: true, cancelable: false })
  deleteEvent.templateId = templateId
  document.dispatchEvent(deleteEvent)
}
