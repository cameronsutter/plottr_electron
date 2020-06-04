const Store = require('electron-store')

const TEMPLATES_PATH = process.env.NODE_ENV == 'development' ? 'templates_dev' : 'templates'
const templateStore = new Store({name: TEMPLATES_PATH})
const CUSTOM_TEMPLATES_PATH = process.env.NODE_ENV == 'development' ? 'custom_templates_dev' : 'custom_templates'
const customTemplateStore = new Store({name: CUSTOM_TEMPLATES_PATH})
const TEMPLATES_ROOT = 'templates'

export function listTemplates (type) {
  const templatesById = templateStore.get(TEMPLATES_ROOT)
  if (!templatesById) return []
  if (!type) return Object.values(templatesById)

  return Object.values(templatesById).filter(t => t.type == type)
}

export function listCustomTemplates (type) {
  const templatesById = customTemplateStore.get(TEMPLATES_ROOT)
  if (!templatesById) return []
  if (!type) return Object.values(templatesById)

  return Object.values(templatesById).filter(t => t.type == type)
}

export function deleteTemplate (id) {
  customTemplateStore.delete(`${TEMPLATES_ROOT}.${id}`)
}

export function editTemplateDetails (id, {name, description, link}) {
  const info = {
    ...customTemplateStore.get(`${TEMPLATES_ROOT}.${id}`),
    name: name,
    description: description,
    link: link,
  }
  customTemplateStore.set(`${TEMPLATES_ROOT}.${id}`, info)
}