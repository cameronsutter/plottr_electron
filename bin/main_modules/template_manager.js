const Store = require('electron-store')
const request = require('request')
const semverGt = require('semver/functions/gt')
const { TEMPLATES_MANIFEST_PATH, TEMPLATES_PATH } = require('./config_paths')
const SETTINGS = require('./settings')

const manifestStore = new Store({name: TEMPLATES_MANIFEST_PATH})
const templateStore = new Store({name: TEMPLATES_PATH})

const MANIFEST_ROOT = 'manifest'
const TEMPLATES_ROOT = 'templates'
const manifestURL = 'https://raw.githubusercontent.com/Plotinator/plottr_templates/master/v2/manifest.json'

class TemplateManager {

  templates = () => {
    return templateStore.get(TEMPLATES_ROOT)
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

  fetchManifest = () => {
    if (SETTINGS.get('premiumFeatures')) {
      request(this.manifestReq(), (err, resp, fetchedManifest) => {
        if (!err && resp && resp.statusCode == 200) {
          if (this.manifestIsNewer(fetchedManifest.version)) {
            manifestStore.set(MANIFEST_ROOT, fetchedManifest)
            this.fetchTemplates()
          }
        }
      })
    }
  }

  manifestIsNewer = (fetchedVersion) => {
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

module.exports = TemplateManager