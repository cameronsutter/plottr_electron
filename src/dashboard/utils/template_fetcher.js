import log from 'electron-log'
import { is } from 'electron-util'
import request from 'request'
import semverGt from 'semver/functions/gt'
import { manifestStore, templatesStore, customTemplatesStore } from '../../file-system/stores'
import { fileSystemAPIs } from '../../api'

const OLD_TEMPLATES_ROOT = 'templates'
let env = 'prod'
if (is.development) env = 'staging'
const settings = fileSystemAPIs.currentAppSettings()
if (settings.betatemplates) env = 'beta'
const baseURL = `https://raw.githubusercontent.com/Plotinator/plottr_templates/${env}`
const manifestURL = `${baseURL}/v2/manifest.json`

export const MANIFEST_ROOT = 'manifest'

class TemplateFetcher {
  constructor(props) {
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
    const templatesById = templatesStore.get()
    if (!type) return Object.values(templatesById)

    const ids = Object.keys(templatesById)
    return ids.reduce((acc, id) => {
      if (templatesById[id].type === type) acc.push(templatesById[id])
      return acc
    }, [])
  }

  manifestReq = () => {
    return {
      url: manifestURL,
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

    log.info('fetching template manifest')
    request(this.manifestReq(), (err, resp, fetchedManifest) => {
      if (!err && resp && resp.statusCode == 200) {
        if (force || this.fetchedIsNewer(fetchedManifest.version)) {
          log.info('new templates found', fetchedManifest.version)
          manifestStore.set(MANIFEST_ROOT, fetchedManifest)
          this.fetchTemplates(force)
        } else {
          log.info('no new template manifest', fetchedManifest.version)
        }
      } else {
        log.error(resp ? resp.statusCode : 'null template manifest response', err)
      }
    })
  }

  fetchedIsNewer = (fetchedVersion) => {
    if (!manifestStore.get('manifest')) return true
    // semverGt checks if 1st > 2nd
    return semverGt(fetchedVersion, manifestStore.get('manifest.version'))
  }

  fetchTemplates = (force) => {
    const templates = manifestStore.get('manifest.templates')
    templates.forEach((template) => {
      if (force || this.templateIsNewer(template.id, template.version)) {
        this.fetchTemplate(template.id, template.url)
      }
    })
  }

  fetchTemplate = (id, url) => {
    const fullURL = `${baseURL}${url}`
    request(this.templateReq(fullURL), (err, resp, fetchedTemplate) => {
      if (!err && resp && resp.statusCode == 200) {
        templatesStore.set(id, fetchedTemplate)
      }
    })
  }

  templateIsNewer = (templateId, manifestVersion) => {
    const storedTemplate = templatesStore.get(templateId)
    if (!storedTemplate) return true
    return semverGt(manifestVersion, storedTemplate.version) // is 1st param > 2nd?
  }
}

const TF = new TemplateFetcher()

export default TF
