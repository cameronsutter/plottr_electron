const Store = require('electron-store')
const { cloneDeep, sortBy } = require('lodash')
const log = require('electron-log')
const { Notification } = require('electron')
const { CUSTOM_TEMPLATES_PATH } = require('./config_paths')
const i18n = require('format-message')

const templatesPath = process.env.NODE_ENV == 'dev' ? `${CUSTOM_TEMPLATES_PATH}_dev` : CUSTOM_TEMPLATES_PATH
const templateStore = new Store({name: templatesPath})
const TEMPLATES_ROOT = 'templates'

class CustomTemplateManager {

  addNew = (pltrData, { type, data }) => {
    if (type == 'plotlines') {
      this.createPlotlineTemplate(pltrData, data)
    } else if (type == 'characters') {
      this.createCharacterTemplate(pltrData, data)
    }

    if (Notification.isSupported()) {
      const notify = new Notification({
        title: i18n('Template Saved'),
        subtitle: data.name,
        body: i18n('Your template has been saved and is ready to use'),
      })
      notify.show()
    }
  }

  createPlotlineTemplate = (pltrData, { name, description, link }) => {
    const data = cloneDeep(pltrData)
    let id = this.makeNewId('pl')

    let template = {
      id: id,
      type: 'plotlines',
      name: name,
      description: description,
      link: link,
      templateData: {}
    }

    // only the chapters in book 1
    const bookChapters = data.chapters.filter(ch => ch.bookId == 1)
    template.templateData.chapters = bookChapters

    // only the lines in book 1
    // only if there are more than 1 line
    const bookLines = data.lines.filter(l => l.bookId == 1)
    if (bookLines.length > 1) {
      template.templateData.lines = bookLines
    }

    // only cards in bookChapters
    if (data.cards.length) {
      const chapterIds = bookChapters.map(ch => ch.id)
      let cards = []

      bookLines.forEach(l => {
        const cardsInLine = data.cards.filter(c => chapterIds.includes(c.chapterId) && c.lineId == l.id)
        cards = cards.concat(cardsInLine)
      })

      template.templateData.cards = cards
    }
    templateStore.set(`${TEMPLATES_ROOT}.${id}`, template)
  }

  createCharacterTemplate = (pltrData, { name, description, link }) => {
    const data = cloneDeep(pltrData)

    let id = this.makeNewId('ch')
    const template = {
      id: id,
      type: 'characters',
      name: name,
      description: description,
      link: link,
      attributes: data.customAttributes.characters,
    }
    templateStore.set(`${TEMPLATES_ROOT}.${id}`, template)
  }

  makeNewId = (prefix) => {
    return Math.random().toString(16).replace('0.', `${prefix}`).substr(0, 8)
  }
}

const CTM = new CustomTemplateManager()

module.exports = CTM