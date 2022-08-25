import fetch from 'node-fetch'
import semverGt from 'semver/functions/gt'
import { isDevelopment } from './isDevelopment'

export const MANIFEST_ROOT = 'manifest'
const OLD_TEMPLATES_ROOT = 'templates'
const DEPRECATED_TEMPLATE_IDS = ['pl6', 'pl12']

const sequencePromises = (promiseThunks) => {
  if (promiseThunks.length === 0) {
    return Promise.resolve()
  }

  const currentPromise = promiseThunks[0]
  const rest = promiseThunks.slice(1)
  return currentPromise().then(() => {
    return sequencePromises(rest)
  })
}

const migrateTemplates = (templatesStore, manifestStore, log) => {
  // MIGRATE ONE TIME (needed after 2020.12.1 for the dashboard)
  log('Migrating built-in templates')
  return templatesStore.currentStore().then(() => {
    const templates = templatesStore.get(OLD_TEMPLATES_ROOT)
    if (templates) {
      return templatesStore
        .clear()
        .then(() => {
          return templatesStore.set(templates)
        })
        .then(() => {
          log('Migrated templates')
        })
        .catch((error) => {
          log('ERROR: Failed to migrate templates, emptying template and manifest stores', error)
          return templatesStore
            .clear()
            .then(() => {
              return manifestStore.clear()
            })
            .catch(() => {
              // If we failed to clear the template store, still clear
              // the manifest store.
              return manifestStore.clear()
            })
            .then(() => {
              log('Cleared built-in template stores')
            })
        })
    }

    log('No templates to migrate')
    return Promise.resolve()
  })
}

const migrateCustomTemplates = (customTemplatesStore, log) => {
  // SAME FOR CUSTOM TEMPLATES (needed after 2020.12.1 for the dashboard)
  log('Migrating custom templates')
  return customTemplatesStore.currentStore().then(() => {
    const customTemplates = customTemplatesStore.get(OLD_TEMPLATES_ROOT)
    if (customTemplates) {
      return customTemplatesStore
        .clear()
        .then(() => {
          return customTemplatesStore.set(customTemplates)
        })
        .then(() => {
          log('Migrated custom templates')
        })
        .catch((error) => {
          log('ERROR: Failed to migrate custom templates, ignoring error and continuing', error)
        })
    }

    log('No custom templates to migrate')
    return Promise.resolve()
  })
}

class TemplateFetcher {
  constructor(baseURL, manifestURL, userDataPath, stores, log) {
    this.baseURL = baseURL
    this.manifestURL = manifestURL
    this.log = log

    const { templatesStore, customTemplatesStore, manifestStore } = stores

    this.templatesStore = templatesStore
    this.customTemplatesStore = customTemplatesStore
    this.manifestStore = manifestStore
  }

  templates = (type) => {
    const templatesById = this.templatesStore.get()
    if (!type) return Object.values(templatesById)

    const ids = Object.keys(templatesById)
    return ids.reduce((acc, id) => {
      if (templatesById[id].type === type) acc.push(templatesById[id])
      return acc
    }, [])
  }

  fetch = (force) => {
    // if (is.development) return

    this.log('Fetching template manifest')
    return fetch(this.manifestURL)
      .then((resp) => {
        if (!resp.ok) {
          return Promise.reject(new Error(`Failed to fetch manifest.  HTTP code: ${resp.status}`))
        }
        return resp.json()
      })
      .then((fetchedManifest) => {
        if (force || this.fetchedIsNewer(fetchedManifest.version)) {
          this.log('New templates to fetch', fetchedManifest.version)
          return this.manifestStore.set(MANIFEST_ROOT, fetchedManifest).then(() => {
            return this.fetchTemplates(force)
          })
        } else {
          this.log('No new templates', fetchedManifest.version)
          return Promise.resolve()
        }
      })
      .then(this.removeDeprecatedTemplates)
  }

  removeDeprecatedTemplates = () => {
    return sequencePromises(
      DEPRECATED_TEMPLATE_IDS.map((templateId) => {
        return () => {
          const manifestTemplates = this.manifestStore.get('manifest.templates')
          const manifestHasTemplate = manifestTemplates.some(({ id }) => {
            return id === templateId
          })
          if (manifestHasTemplate) {
            this.log(`Found deprecated template in manifest (${templateId}).  Deleting it.`)
          }
          const oldManifest = this.manifestStore.get()
          const newManifest = {
            manifest: {
              ...oldManifest.manifest,
              templates: oldManifest.manifest.templates.filter(({ id }) => {
                return id !== templateId
              }),
            },
          }
          const removeManifestEntry = manifestHasTemplate
            ? this.manifestStore.set(newManifest)
            : Promise.resolve()
          if (this.templatesStore.has(templateId)) {
            this.log(`Found deprecated template (${templateId}).  Deleting it.`)
          }
          const removeTemplateStoreEntry = this.templatesStore.has(templateId)
            ? this.templatesStore.delete(templateId)
            : Promise.resolve()
          return Promise.all([removeManifestEntry, removeTemplateStoreEntry])
        }
      })
    )
  }

  fetchedIsNewer = (fetchedVersion) => {
    if (!this.manifestStore.get('manifest')) return true
    // semverGt checks if 1st > 2nd
    return semverGt(fetchedVersion, this.manifestStore.get('manifest.version'))
  }

  fetchTemplates = (force) => {
    const templates = this.manifestStore.get('manifest.templates')
    const templateRequests = templates.map((template) => {
      if (force || this.templateIsNewer(template.id, template.version)) {
        return this.fetchTemplate(template.id, template.url)
      }
      return Promise.resolve()
    })
    return Promise.all(templateRequests)
  }

  fetchTemplate = (id, url) => {
    const fullURL = `${this.baseURL}${url}`
    return fetch(fullURL)
      .then((resp) => {
        if (!resp.ok) {
          return Promise.reject(
            new Error(
              `Failed to fetch template with id ${id} from ${url}.  HTTP code: ${resp.status}`
            )
          )
        }
        return resp.json()
      })
      .then((fetchedTemplate) => {
        return this.templatesStore.set(id, fetchedTemplate)
      })
  }

  templateIsNewer = (templateId, manifestVersion) => {
    const storedTemplate = this.templatesStore.get(templateId)
    if (!storedTemplate) return true
    return semverGt(manifestVersion, storedTemplate.version) // is 1st param > 2nd?
  }
}

const makeTemplateFetcher = (userDataPath) => {
  let env = 'prod'
  if (isDevelopment()) env = 'staging'

  return (stores, logInfo) => {
    if (stores.SETTINGS.betatemplates) env = 'beta'

    const baseURL = `https://raw.githubusercontent.com/Plotinator/plottr_templates/${env}`
    const manifestURL = `${baseURL}/v2/manifest.json`

    const { templatesStore, customTemplatesStore, manifestStore } = stores

    logInfo('Migrating templates')
    return migrateCustomTemplates(customTemplatesStore, logInfo).then(() => {
      return migrateTemplates(templatesStore, manifestStore, logInfo).then(() => {
        return new TemplateFetcher(baseURL, manifestURL, userDataPath, stores, logInfo)
      })
    })
  }
}

export default makeTemplateFetcher
