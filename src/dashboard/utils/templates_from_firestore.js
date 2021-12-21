import { useMemo } from 'react'
import { is } from 'electron-util'
import axios from 'axios'
import semverGt from 'semver/functions/gt'
import { sortBy } from 'lodash'
import {
  listenToCustomTemplates as listenToCustomTemplatesFromFirestore,
  saveCustomTemplate as saveCustomTemplateToFirstore,
  deleteCustomTemplate as deleteCustomTemplateOnFirestore,
  editCustomTemplate as editCustomTemplateOnFirestore,
} from 'wired-up-firebase'

import { SETTINGS } from '../../file-system/stores'

let env = 'prod'
if (is.development) env = 'staging'
if (SETTINGS.get('betatemplates')) env = 'beta'
const baseURL = `https://raw.githubusercontent.com/Plotinator/plottr_templates/${env}`
const manifestURL = `${baseURL}/v2/manifest.json`

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

const sessionStorageValue = (key) => {
  const valueString = window.sessionStorage.getItem(key)
  if (!valueString) return null
  return safeParse(valueString)
}

const manifest = () => {
  return sessionStorageValue(TEMPLATE_MANIFEST_KEY)
}

const fetchedManifestIsNewer = (fetchedManifest) => {
  const existingManifest = manifest()
  if (!existingManifest) return true

  return semverGt(fetchedManifest.version, existingManifest.version)
}

const templateKey = (templateId) => {
  return `${TEMPLATE_PREFIX}${templateId}`
}

const saveTemplate = (template) => {
  window.sessionStorage.setItem(templateKey(template.id), JSON.stringify(template))
}

const saveManifest = (manifest) => {
  window.sessionStorage.setItem(TEMPLATE_MANIFEST_KEY, JSON.stringify(manifest))
}

export const seedTemplates = (force = false, projectStructureEnabled = false) => {
  axios
    .get(manifestURL)
    .then((response) => {
      if (response.status == 200) {
        const manifest = response.data
        if (force || fetchedManifestIsNewer(manifest)) {
          saveManifest(manifest)
          console.log('new templates found', manifest.version)
          return fetchTemplates(force, manifest)
        } else {
          console.log('No new template manifest', manifest.version)
          return []
        }
      } else {
        return Promise.reject(`Non 200 response for fetching the manifest ${response}`)
      }
    })
    .then((templates) => {
      console.log(
        'Fetched template with ids',
        templates.map(({ id }) => id)
      )
      templates.forEach(saveTemplate)
    })
    .catch((error) => {
      console.error('Error fetching templates', error)
    })
}

const fetchTemplate = (id, url) => {
  return axios.get(url).then((response) => {
    if (response.status == 200) {
      return response.data
    } else {
      return Promise.reject(`Non 200 code in ${response}`)
    }
  })
}

const templateById = (templateId) => {
  return sessionStorageValue(templateKey(templateId))
}

const templateIsNewer = (templateId, templateVersion) => {
  const existingTemplate = templateById(templateId)
  if (!existingTemplate) return true

  return semverGt(templateVersion, existingTemplate.version)
}

const fetchTemplates = (force, manifest) => {
  return Promise.all(
    manifest.templates.map((template) => {
      if (force || templateIsNewer(template.id, template.version)) {
        return fetchTemplate(template.id, template.url)
      } else {
        return templateById(template.id)
      }
    })
  )
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

export const listTemplates = (type) => {
  return sortBy(
    allTemplates().filter((template) => template.type === type),
    'name'
  )
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

export const listenToCustomTemplates = (userId) => {
  return listenToCustomTemplatesFromFirestore(userId, (customTemplates) => {
    return saveCustomTemplatesToStorage(Object.values(customTemplates))
  })
}

export const deleteCustomTemplate = (templateId, userId) => {
  window.sessionStorage.removeItem(customTemplateKey(templateId))
  deleteCustomTemplateOnFirestore(userId, templateId)
}

export const editCustomTemplate = (templateId, template) => {
  return editCustomTemplateOnFirestore(templateId, template)
}

export const listCustomTemplates = (type) => {
  return sortBy(
    allCustomTemplates().filter((template) => template.type === type),
    'name'
  )
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

export const useFilteredSortedTemplates = (templatesById, type, searchTerm) => {
  const filteredTemplates = useMemo(() => {
    return sortBy(
      Object.values(templatesById).filter((t) => {
        if (searchTerm && searchTerm.length > 1) {
          return t.name.toLowerCase().includes(searchTerm) && t.type == type
        } else {
          return t.type == type
        }
      }),
      'name'
    )
  }, [templatesById, searchTerm])

  return filteredTemplates
}
