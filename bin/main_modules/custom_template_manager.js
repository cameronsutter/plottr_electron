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

  addNew = (pltrData, { includePlotline, includeCharacter, plotline, character }) => {
    const data = cloneDeep(pltrData)

    // //
    // Create the plotline template
    // //
    if (includePlotline) {

      let plId = this.makeNewId('pl')

      let plTemplate = {
        id: plId,
        type: 'plotlines',
        name: plotline.name,
        description: plotline.description,
        link: plotline.link,
        templateData: {}
      }

      // only the chapters in book 1
      const bookChapters = data.chapters.filter(ch => ch.bookId == 1)
      plTemplate.templateData.chapters = bookChapters

      // only the lines in book 1
      // only if there are more than 1 line
      const bookLines = data.lines.filter(l => l.bookId == 1)
      if (bookLines.length > 1) {
        plTemplate.templateData.lines = bookLines
      }

      // only cards in bookChapters
      // create new ids for the cards based on the chapter's position (for each line)
      // because that's how the template picker needs cards sorted
      if (data.cards.length) {
        const chapterIds = bookChapters.map(ch => ch.id)
        const sortedChapters = sortBy(bookChapters, 'position')
        const sortedCards = []

        bookLines.forEach((l, idx) => {
          const firstId = idx + 10
          const bookCardsByChapterId = data.cards.reduce((acc, card) => {
            if (chapterIds.includes(card.chapterId) && card.lineId == l.id) {
              acc[card.chapterId] = card
            }
            return acc
          }, {})
          sortedChapters.forEach((ch, jdx) => {
            if (bookCardsByChapterId[ch.id]) {
              let card = bookCardsByChapterId[ch.id]
              card.id = (jdx + 1) * firstId
              sortedCards.push(card)
            }
          })
        })

        plTemplate.templateData.cards = sortedCards
      }
      templateStore.set(`${TEMPLATES_ROOT}.${plId}`, plTemplate)
    }

    // //
    // Create the character template
    // //
    if (includeCharacter && data.customAttributes.characters.length) {
      let chId = this.makeNewId('ch')
      const chTemplate = {
        id: chId,
        type: 'characters',
        name: character.name,
        description: character.description,
        link: character.link,
        attributes: data.customAttributes.characters,
      }
      templateStore.set(`${TEMPLATES_ROOT}.${chId}`, chTemplate)
    }

    if (Notification.isSupported()) {
      const notify = new Notification({
        title: i18n('Template Saved'),
        body: i18n('Your template has been saved and is ready to use'),
      })
      notify.show()
    }
  }

  makeNewId = (prefix) => {
    return Math.random().toString(16).replace('0.', `${prefix}`).substr(0, 8)
  }
}

const CTM = new CustomTemplateManager()

module.exports = CTM