import Store from 'electron-store'
import { sortBy } from 'lodash'
import {
  getCustomTemplateById,
  listCustomTemplates as listCustomTemplatesFromFirebase,
  deleteCustomTemplate,
  editCustomTemplate,
} from '../../dashboard/utils/templates_from_firestore'

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

  const templateFromFirebase = getCustomTemplateById(id)
  if (templateFromFirebase) return templateFromFirebase

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

export const listCustomTemplates = (cloudOnly) => (type) => {
  if (cloudOnly) {
    return sortBy(listCustomTemplatesFromFirebase(type), 'name')
  }

  const templatesById = customTemplateStore.get()
  if (!templatesById) return []
  if (!type) return Object.values(templatesById)

  const localTemplates = Object.values(templatesById).filter((t) => t.type == type)

  return sortBy(localTemplates, 'name')
}

const isLocalTemplate = (id) => {
  const customById = customTemplateStore.get()
  return customById && customById[id]
}

export function deleteTemplate(id, userId) {
  if (isLocalTemplate(id)) {
    customTemplateStore.delete(id)
    return
  }

  deleteCustomTemplate(id, userId)
}

export function editTemplateDetails(id, { name, description, link }) {
  const info = {
    ...getTemplateById(id),
    name: name,
    description: description,
    link: link,
  }
  if (isLocalTemplate(id)) {
    customTemplateStore.set(id, info)
    return
  }

  editCustomTemplate(id, info)
}
