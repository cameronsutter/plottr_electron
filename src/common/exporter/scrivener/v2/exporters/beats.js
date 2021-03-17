import { keyBy } from 'lodash'
import i18n from 'format-message'
import {
  buildDescriptionFromObject,
  createFolderBinderItem,
  createTextBinderItem,
  buildTemplateProperties,
} from '../utils'
import { helpers, selectors } from 'pltr/v2'

const {
  sortedLinesByBookSelector,
  cardMapSelector,
  sortedBeatsByBookSelector,
  makeBeatTitleSelector,
  cardsCustomAttributesSelector,
} = selectors
const {
  card: { sortCardsInBeat, cardMapping },
} = helpers

export default function exportBeats(state, documentContents, options) {
  // get current book id and select only those beats/lines/cards
  const beats = sortedBeatsByBookSelector(state)
  const lines = sortedLinesByBookSelector(state)
  const card2Dmap = cardMapSelector(state)
  const beatCardMapping = cardMapping(beats, lines, card2Dmap, null)
  const linesById = keyBy(lines, 'id')
  const customAttrs = cardsCustomAttributesSelector(state)

  // create a BinderItem for each beat (Type: Folder)
  //   create a BinderItem for each card (Type: Text)

  return beats.map((beat) => {
    const uniqueBeatTitleSelector = makeBeatTitleSelector(state)
    const title = uniqueBeatTitleSelector(state, beat.id)
    const { binderItem } = createFolderBinderItem(title)

    if (options.outline.sceneCards) {
      // sort cards into beats by lines (like outline auto-sorting)
      const cards = beatCardMapping[beat.id]
      const sortedCards = sortCardsInBeat(beat.autoOutlineSort, cards, lines)
      sortedCards.forEach((c) => {
        const { id, binderItem: cardItem } = createTextBinderItem(c.title)
        binderItem['Children']['BinderItem'].push(cardItem)

        // save card info into documentContents
        let title = ''
        const lineId = c.lineId
        const line = linesById[lineId]
        if (line) title = line.title

        let descObj = {}

        if (options.outline.customAttributes) {
          customAttrs.reduce((acc, entry) => {
            acc[entry.name] = c[entry.name]
            return acc
          }, descObj)
        }

        if (options.outline.templates) {
          c.templates.forEach((t) => {
            t.attributes.forEach((attr) => {
              if (descObj[attr.name]) {
                descObj[`${t.name}:${attr.name}`] = attr.value
              } else {
                descObj[attr.name] = attr.value
              }
            })
          })
        }

        if (options.outline.where == 'notes') {
          descObj.description = c.description
        }

        let description = buildDescriptionFromObject(descObj, options.outline)

        // handle template properties
        if (options.outline.templates) {
          description = [
            ...description,
            ...buildDescriptionFromObject(buildTemplateProperties(c.templates), true),
          ]
        }

        const contents = {
          docTitle: options.outline.plotlineInTitle ? i18n('Plotline: {title}', { title }) : null,
          description: description,
        }
        documentContents[id] = {
          notes: contents,
        }

        if (options.outline.where != 'notes') {
          documentContents[id][options.outline.where] = {
            description: buildDescriptionFromObject(
              { description: c.description },
              options.outline
            ),
          }
        }
      })
    }

    return binderItem
  })
}
