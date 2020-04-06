const Store = require('electron-store')
const request = require('request')
const semverGt = require('semver/functions/gt')
const { TEMPLATES_MANIFEST_PATH, TEMPLATES_PATH } = require('./config_paths')

const manifestPath = process.env.NODE_ENV == 'dev' ? `${TEMPLATES_MANIFEST_PATH}_dev` : TEMPLATES_MANIFEST_PATH
const templatesPath = process.env.NODE_ENV == 'dev' ? `${TEMPLATES_PATH}_dev` : TEMPLATES_PATH

const manifestStore = new Store({name: manifestPath})
const templateStore = new Store({name: templatesPath})

const MANIFEST_ROOT = 'manifest'
const TEMPLATES_ROOT = 'templates'
const manifestURL = 'https://raw.githubusercontent.com/Plotinator/plottr_templates/master/v2/manifest.json'

class TemplateManager {

  templates = (type) => {
    const templatesById = templateStore.get(TEMPLATES_ROOT)
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

  load = () => {
    request(this.manifestReq(), (err, resp, fetchedManifest) => {
      if (!err && resp && resp.statusCode == 200) {
        if (this.fetchedIsNewer(fetchedManifest.version)) {
          manifestStore.set(MANIFEST_ROOT, fetchedManifest)
          this.fetchTemplates()
        }
        // else {
        //   console.info('no new template manifest', fetchedManifest.version)
        // }
      } else {
        console.warn(resp.statusCode, err)
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
        templateStore.set(`templates.${id}`, fetchedTemplate)
      }
    })
  }

  templateIsNewer = (templateId, manifestVersion) => {
    const storedTemplate = templateStore.get(`templates.${templateId}`)
    if (!storedTemplate) return true
    return semverGt(manifestVersion, storedTemplate.version) // is 1st param greater than 2nd?
  }
}

const TM = new TemplateManager()

module.exports = TM