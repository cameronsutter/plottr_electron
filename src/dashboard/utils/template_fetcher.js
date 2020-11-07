import Store from 'electron-store'
import log from 'electron-log'
import request from 'request'
import semverGt from 'semver/functions/gt'
import { TEMPLATES_MANIFEST_PATH, TEMPLATES_PATH, CUSTOM_TEMPLATES_PATH } from '../../common/utils/config_paths'

const manifestPath = process.env.NODE_ENV == 'development' ? `${TEMPLATES_MANIFEST_PATH}_dev` : TEMPLATES_MANIFEST_PATH
const templatesPath = process.env.NODE_ENV == 'development' ? `${TEMPLATES_PATH}_dev` : TEMPLATES_PATH
const customTemplatesPath = process.env.NODE_ENV == 'development' ? `${CUSTOM_TEMPLATES_PATH}_dev` : CUSTOM_TEMPLATES_PATH

const manifestStore = new Store({name: manifestPath})
const templateStore = new Store({name: templatesPath})
const customTemplatesStore = new Store({name: customTemplatesPath})

const MANIFEST_ROOT = 'manifest'
const TEMPLATES_ROOT = 'templates'
const manifestURL = 'https://raw.githubusercontent.com/Plotinator/plottr_templates/master/v2/manifest.json'

class TemplateFetcher {

  constructor (props) {
    // MIGRATE ONE TIME
    const templates = templateStore.get(TEMPLATES_ROOT)
    if (templates) {
      console.log('GOT HERE')
      templateStore.clear()
      templateStore.set(templates)
    }

    // SAME FOR CUSTOM TEMPLATES
    const customTemplates = customTemplatesStore.get(TEMPLATES_ROOT)
    if (customTemplates) {
      customTemplatesStore.clear()
      customTemplatesStore.set(customTemplates)
    }
  }

  templates = (type) => {
    const templatesById = templateStore.get()
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

  fetch = () => {
    log.info('fetching template manifest')
    request(this.manifestReq(), (err, resp, fetchedManifest) => {
      if (!err && resp && resp.statusCode == 200) {
        if (this.fetchedIsNewer(fetchedManifest.version)) {
          log.info('new templates found', fetchedManifest.version)
          manifestStore.set(MANIFEST_ROOT, fetchedManifest)
          this.fetchTemplates()
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
    return semverGt(fetchedVersion, manifestStore.get('manifest.version')) // is 1st param greater than 2nd?
  }

  fetchTemplates = () => {
    const templates = manifestStore.get('manifest.templates')
    templates.forEach(template => {
      if (this.templateIsNewer(template.id, template.version)) {
        this.fetchTemplate(template.id, template.url)
      }
    })
  }

  fetchTemplate = (id, url) => {
    request(this.templateReq(url), (err, resp, fetchedTemplate) => {
      if (!err && resp && resp.statusCode == 200) {
        templateStore.set(id, fetchedTemplate)
      }
    })
  }

  templateIsNewer = (templateId, manifestVersion) => {
    const storedTemplate = templateStore.get(templateId)
    if (!storedTemplate) return true
    return semverGt(manifestVersion, storedTemplate.version) // is 1st param greater than 2nd?
  }
}

const TF = new TemplateFetcher()

export default TF