import request from 'request'
import semverGt from 'semver/functions/gt'
import { isDevelopment } from './isDevelopment'

import makeStores from './stores'

export const MANIFEST_ROOT = 'manifest'
const OLD_TEMPLATES_ROOT = 'templates'

class TemplateFetcher {
  constructor(baseURL, manifestURL, userDataPath, log) {
    this.baseURL = baseURL
    this.manifestURL = manifestURL
    this.log = log

    const basicLogger = {
      info: log,
      warn: log,
      error: log,
    }
    const { templatesStore, customTemplatesStore, manifestStore } = makeStores(
      userDataPath,
      basicLogger
    )
    this.templatesStore = templatesStore
    this.customTemplatesStore = customTemplatesStore
    this.manifestStore = manifestStore

    // MIGRATE ONE TIME (needed after 2020.12.1 for the dashboard)
    const templates = templatesStore.get(OLD_TEMPLATES_ROOT)
    if (templates) {
      templatesStore.clear()
      templatesStore.set(templates)
    }

    // SAME FOR CUSTOM TEMPLATES (needed after 2020.12.1 for the dashboard)
    const customTemplates = customTemplatesStore.get(OLD_TEMPLATES_ROOT)
    if (customTemplates) {
      customTemplatesStore.clear()
      customTemplatesStore.set(customTemplates)
    }
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

  manifestReq = () => {
    return {
      url: this.manifestURL,
      json: true,
    }
  }

  templateReq = (url) => {
    return {
      url: url,
      json: true,
    }
  }

  fetch = (force) => {
    // if (is.development) return

    this.log('fetching template manifest')
    request(this.manifestReq(), (err, resp, fetchedManifest) => {
      if (!err && resp && resp.statusCode == 200) {
        if (force || this.fetchedIsNewer(fetchedManifest.version)) {
          this.log('new templates found', fetchedManifest.version)
          this.manifestStore.set(MANIFEST_ROOT, fetchedManifest)
          this.fetchTemplates(force)
        } else {
          this.log('no new template manifest', fetchedManifest.version)
        }
      } else {
        this.log(resp ? resp.statusCode : 'null template manifest response', err)
      }
    })
  }

  fetchedIsNewer = (fetchedVersion) => {
    if (!this.manifestStore.get('manifest')) return true
    // semverGt checks if 1st > 2nd
    return semverGt(fetchedVersion, this.manifestStore.get('manifest.version'))
  }

  fetchTemplates = (force) => {
    const templates = this.manifestStore.get('manifest.templates')
    templates.forEach((template) => {
      if (force || this.templateIsNewer(template.id, template.version)) {
        this.fetchTemplate(template.id, template.url)
      }
    })
  }

  fetchTemplate = (id, url) => {
    const fullURL = `${this.baseURL}${url}`
    request(this.templateReq(fullURL), (err, resp, fetchedTemplate) => {
      if (!err && resp && resp.statusCode == 200) {
        this.templatesStore.set(id, fetchedTemplate)
      }
    })
  }

  templateIsNewer = (templateId, manifestVersion) => {
    const storedTemplate = this.templatesStore.get(templateId)
    if (!storedTemplate) return true
    return semverGt(manifestVersion, storedTemplate.version) // is 1st param > 2nd?
  }
}

const makeTemplateFetcher = (userDataPath, logInfo) => {
  const basicLogger = {
    info: logInfo,
    warn: logInfo,
    error: logInfo,
  }
  const { SETTINGS } = makeStores(userDataPath, basicLogger)
  let env = 'prod'
  if (isDevelopment()) env = 'staging'
  if (SETTINGS.betatemplates) env = 'beta'

  const baseURL = `https://raw.githubusercontent.com/Plotinator/plottr_templates/${env}`
  const manifestURL = `${baseURL}/v2/manifest.json`

  return new TemplateFetcher(baseURL, manifestURL, userDataPath, logInfo)
}

export default makeTemplateFetcher
