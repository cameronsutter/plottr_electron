import Store from 'electron-store'
import { sortBy } from 'lodash'

const TEMPLATES_PATH = process.env.NODE_ENV == 'development' ? 'templates_dev' : 'templates'
const templateStore = new Store({ name: TEMPLATES_PATH })
const CUSTOM_TEMPLATES_PATH =
  process.env.NODE_ENV == 'development' ? 'custom_templates_dev' : 'custom_templates'
export const customTemplateStore = new Store({ name: CUSTOM_TEMPLATES_PATH })

export function getTemplateById(id) {
  const templatesById = templateStore.get()
  if (templatesById && templatesById[id]) return templatesById[id]

  const customById = customTemplateStore.get()
  if (customById && customById[id]) return customById[id]
  return null
}

export function listTemplates(type) {
  const templatesById = templateStore.get()
  if (!templatesById) return []
  if (!type) return Object.values(templatesById)

  return sortBy(
    Object.values(templatesById).filter((t) => t.type == type),
    'name'
  )
}

export function listCustomTemplates(type) {
  const templatesById = customTemplateStore.get()
  if (!templatesById) return []
  if (!type) return Object.values(templatesById)

  return sortBy(
    Object.values(templatesById).filter((t) => t.type == type),
    'name'
  )
}

export function deleteTemplate(id) {
  customTemplateStore.delete(id)
}

export function editTemplateDetails(id, { name, description, link }) {
  const info = {
    ...customTemplateStore.get(id),
    name: name,
    description: description,
    link: link,
  }
  customTemplateStore.set(id, info)
}
