import { cloneDeep } from 'lodash'

import { t } from 'plottr_locales'
import { tree, helpers, selectors } from 'pltr/v2'

import { saveCustomTemplate } from './templates_from_firestore'
import { whenClientIsReady } from '../../../shared/socket-client/index'
import { makeMainProcessClient } from '../../app/mainProcessClient'

const { getVersion, notify } = makeMainProcessClient()

export function addNewCustomTemplate(pltrData, { type, data }) {
  let templatePromise = null
  if (type === 'plotlines') {
    templatePromise = createPlotlineTemplate(pltrData, data)
  } else if (type === 'characters') {
    templatePromise = createCharacterTemplate(pltrData, data)
  } else if (type === 'scenes') {
    templatePromise = createScenesTemplate(pltrData, data)
  }

  templatePromise.then((template) => {
    const {
      client: { userId },
    } = pltrData
    if (userId) {
      saveCustomTemplate(userId, template)
    } else {
      whenClientIsReady(({ setCustomTemplate }) => {
        setCustomTemplate(template.id, template)
      })
    }

    notify(t('Template Saved'), t('Your template has been saved and is ready to use'))
  })
}

function createPlotlineTemplate(pltrData, { name, description, link, bias }) {
  const data = cloneDeep(pltrData)
  const id = makeNewId('pl')
  const bookId = selectors.currentTimelineSelector(data)

  return getVersion().then((version) => {
    let template = {
      id: id,
      version: version,
      type: 'plotlines',
      name: name,
      description: description,
      link: link,
      mergeBias: bias,
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

    const hierarchyLevels = selectors.hierarchyLevelsSelector(pltrData)
    template.templateData.hierarchyLevels = { 1: hierarchyLevels }

    return template
  })
}

function createCharacterTemplate(pltrData, { name, description, link }) {
  const data = cloneDeep(pltrData)

  let id = makeNewId('ch')
  const attributes = selectors.allNonBaseCharacterAttributesSelector(data).map((attribute) => {
    return {
      type: attribute.type,
      name: attribute.name,
    }
  })
  return getVersion().then((version) => {
    const template = {
      id: id,
      version: version,
      type: 'characters',
      name: name,
      description: description,
      link: link,
      attributes,
    }
    return template
  })
}

function createScenesTemplate(pltrData, { name, description, link }) {
  const data = cloneDeep(pltrData)

  let id = makeNewId('sc')
  return getVersion().then((version) => {
    const template = {
      id: id,
      version: version,
      type: 'scenes',
      name: name,
      description: description,
      link: link,
      attributes: data.customAttributes.scenes,
    }
    return template
  })
}

function makeNewId(prefix) {
  return Math.random().toString(16).replace('0.', `${prefix}`).substr(0, 8)
}
