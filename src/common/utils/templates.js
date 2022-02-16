import Store from 'electron-store'
import { deleteCustomTemplate, editCustomTemplate } from './templates_from_firestore'

const TEMPLATES_PATH = process.env.NODE_ENV == 'development' ? 'templates_dev' : 'templates'
const CUSTOM_TEMPLATES_PATH =
  process.env.NODE_ENV == 'development' ? 'custom_templates_dev' : 'custom_templates'
export const customTemplateStore = new Store({ name: CUSTOM_TEMPLATES_PATH })

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

export function editTemplateDetails(id, templateData, userId) {
  const info = {
    name: templateData.name,
    description: templateData.description,
    link: templateData.link,
  }
  if (isLocalTemplate(id)) {
    customTemplateStore.set(id, info)
    return
  }

  editCustomTemplate(userId, { ...templateData, id })
}
