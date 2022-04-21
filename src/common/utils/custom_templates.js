import { cloneDeep } from 'lodash'
import { ipcRenderer } from 'electron'
import { app } from '@electron/remote'

import { t } from 'plottr_locales'
import { tree, helpers } from 'pltr/v2'

import { customTemplatesStore } from '../../file-system/stores'
import { saveCustomTemplate } from './templates_from_firestore'

export function addNewCustomTemplate(pltrData, { type, data }) {
  let template = null
  if (type === 'plotlines') {
    template = createPlotlineTemplate(pltrData, data)
  } else if (type === 'characters') {
    template = createCharacterTemplate(pltrData, data)
  } else if (type === 'scenes') {
    template = createScenesTemplate(pltrData, data)
  }

  const {
    client: { userId },
  } = pltrData
  if (userId) {
    saveCustomTemplate(userId, template)
  } else {
    customTemplatesStore.set(template.id, template)
  }

  try {
    ipcRenderer.send(
      'notify',
      t('Template Saved'),
      t('Your template has been saved and is ready to use')
    )
  } catch (error) {
    // ignore
    // on windows you need something called an Application User Model ID which may not work
  }
}

function createPlotlineTemplate(pltrData, { name, description, link }) {
  const data = cloneDeep(pltrData)
  const id = makeNewId('pl')
  const bookId = data.ui.currentTimeline

  let template = {
    id: id,
    version: app.getVersion(),
    type: 'plotlines',
    name: name,
    description: description,
    link: link,
    templateData: {},
  }

  // only the beats in current book
  const beats = data.beats[bookId]
  // change bookId to 1
  template.templateData.beats = {
    1: tree.map(beats, (book) => {
      book.bookId = 1
      return book
    }),
  }

  // only the lines in current book
  const bookLines = data.lines.filter((line) => line.bookId === bookId)
  // change bookId to 1
  template.templateData.lines = bookLines.map((l) => {
    l.bookId = 1
    return l
  })

  // only cards in beats
  if (data.cards.length) {
    const beatIds = helpers.beats.beatIds(beats)
    let cards = []

    bookLines.forEach((line) => {
      const cardsInLine = data.cards.filter(
        ({ beatId, lineId }) => beatIds.includes(beatId) && lineId == line.id
      )
      cards = cards.concat(cardsInLine)
    })

    template.templateData.cards = cards
  }
  return template
}

function createCharacterTemplate(pltrData, { name, description, link }) {
  const data = cloneDeep(pltrData)

  let id = makeNewId('ch')
  const template = {
    id: id,
    version: app.getVersion(),
    type: 'characters',
    name: name,
    description: description,
    link: link,
    attributes: data.customAttributes.characters,
  }
  return template
}

function createScenesTemplate(pltrData, { name, description, link }) {
  const data = cloneDeep(pltrData)

  let id = makeNewId('sc')
  const template = {
    id: id,
    version: app.getVersion(),
    type: 'scenes',
    name: name,
    description: description,
    link: link,
    attributes: data.customAttributes.scenes,
  }
  return template
}

function makeNewId(prefix) {
  return Math.random().toString(16).replace('0.', `${prefix}`).substr(0, 8)
}
