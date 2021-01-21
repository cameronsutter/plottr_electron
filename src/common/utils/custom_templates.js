import { cloneDeep } from 'lodash'
import { Notification } from 'electron'
import t from 'format-message'
import { customTemplatesStore } from './store_hooks'

export function addNewCustomTemplate(pltrData, { type, data }) {
  if (type === 'plotlines') {
    createPlotlineTemplate(pltrData, data)
  } else if (type === 'characters') {
    createCharacterTemplate(pltrData, data)
  } else if (type === 'scenes') {
    createScenesTemplate(pltrData, data)
  }

  try {
    new Notification(t('Template Saved'), {
      body: t('Your template has been saved and is ready to use'),
      silent: true,
    })
  } catch (error) {
    // ignore
    // on windows you need something called an Application User Model ID which may not work
  }
}

function createPlotlineTemplate(pltrData, { name, description, link }) {
  const data = cloneDeep(pltrData)
  let id = makeNewId('pl')
  let bookId = data.ui.currentTimeline

  let template = {
    id: id,
    type: 'plotlines',
    name: name,
    description: description,
    link: link,
    templateData: {},
  }

  // only the chapters in book 1
  const bookChapters = data.chapters.filter((ch) => ch.bookId == bookId) // TODO: make it work for series
  template.templateData.chapters = bookChapters

  // only the lines in book 1
  // only if there are more than 1 line
  const bookLines = data.lines.filter((l) => l.bookId == bookId) // TODO: make it work for series
  if (bookLines.length > 1) {
    template.templateData.lines = bookLines
  }

  // only cards in bookChapters
  if (data.cards.length) {
    const chapterIds = bookChapters.map((ch) => ch.id)
    let cards = []

    bookLines.forEach((l) => {
      const cardsInLine = data.cards.filter(
        (c) => chapterIds.includes(c.chapterId) && c.lineId == l.id
      )
      cards = cards.concat(cardsInLine)
    })

    template.templateData.cards = cards
  }
  customTemplatesStore.set(id, template)
}

function createCharacterTemplate(pltrData, { name, description, link }) {
  const data = cloneDeep(pltrData)

  let id = makeNewId('ch')
  const template = {
    id: id,
    type: 'characters',
    name: name,
    description: description,
    link: link,
    attributes: data.customAttributes.characters,
  }
  customTemplatesStore.set(id, template)
}

function createScenesTemplate(pltrData, { name, description, link }) {
  const data = cloneDeep(pltrData)

  let id = makeNewId('sc')
  const template = {
    id: id,
    type: 'scenes',
    name: name,
    description: description,
    link: link,
    attributes: data.customAttributes.scenes,
  }
  customTemplatesStore.set(id, template)
}

function makeNewId(prefix) {
  return Math.random().toString(16).replace('0.', `${prefix}`).substr(0, 8)
}
