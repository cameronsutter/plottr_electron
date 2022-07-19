import { whenClientIsReady } from '../../../shared/socket-client/index'
import makeFileSystemAPIs from '../../api/file-system-apis'
import {
  deleteCustomTemplate as deleteCustomTemplateOnFirebase,
  editCustomTemplate,
} from './templates_from_firestore'

const TEMPLATES_PATH = process.env.NODE_ENV == 'development' ? 'templates_dev' : 'templates'
const CUSTOM_TEMPLATES_PATH =
  process.env.NODE_ENV == 'development' ? 'custom_templates_dev' : 'custom_templates'

export function deleteTemplate(id, userId) {
  const { currentCustomTemplates } = makeFileSystemAPIs(whenClientIsReady)
  currentCustomTemplates().then((templates) => {
    if (templates.find((template) => template.id === id)) {
      whenClientIsReady(({ deleteCustomTemplate }) => {
        deleteCustomTemplate(id)
      })
      return
    }
    deleteCustomTemplateOnFirebase(id, userId)
  })
}

export function editTemplateDetails(id, templateData, userId) {
  const info = {
    name: templateData.name,
    description: templateData.description,
    link: templateData.link,
  }
  const { currentCustomTemplates } = makeFileSystemAPIs(whenClientIsReady)
  currentCustomTemplates().then((templates) => {
    if (templates.find((template) => template.id === id)) {
      whenClientIsReady(({ setCustomTemplate }) => {
        setCustomTemplate(id, info)
      })
      return
    }
    editCustomTemplate(userId, { ...templateData, id })
  })
}
