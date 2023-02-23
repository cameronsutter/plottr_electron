import { t } from 'plottr_locales'
import { Paragraph, AlignmentType, HeadingLevel, ImageRun } from 'docx'
import { selectors } from 'pltr/v2'

import exportItemTemplates from './itemTemplates'
import { serialize } from './to_word'

const { characterCategoriesSelector } = selectors

export default function exportCharacters(state, options) {
  const directives = characterDataExportDirectives(state, options)
  const images = selectors.imagesSelector(state)
  return [{ children: interpret(directives, images) }]
}

const seriesToAll = (timelineName) => {
  if (timelineName === 'series') {
    return 'all'
  }
  return timelineName
}

export function characterDataExportDirectives(state, options) {
  if (!options.characters.export) {
    return []
  }

  const allCharacterCategories = Object.values(characterCategoriesSelector(state))
  let paragraphs = []

  const showBookTabs = selectors.showBookTabsSelector(state)
  const bookToExport = !showBookTabs ? 'all' : seriesToAll(selectors.currentTimelineSelector(state))
  const allCharacters = selectors.allDisplayedCharactersForCurrentBookSelector(
    state,
    null,
    bookToExport
  )
  const attributesSelector = (characterId) =>
    selectors.characterAttributesSelector(state, characterId, bookToExport)

  if (options.characters.heading) {
    paragraphs.push({
      type: 'paragraph',
      text: t('Characters'),
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    })
  }

  allCharacters.forEach((ch) => {
    paragraphs.push({ type: 'paragraph', text: '' })
    paragraphs.push({ type: 'paragraph', text: ch.name, heading: HeadingLevel.HEADING_2 })
    if (options.characters.images && ch.imageId) {
      const imageId = ch.imageId
      paragraphs.push({
        type: 'image-paragraph',
        imageId,
      })
    }
    if (options.characters.descriptionHeading) {
      paragraphs.push({
        type: 'paragraph',
        text: t('Description'),
        heading: HeadingLevel.HEADING_3,
      })
    }
    if (options.characters.description) {
      paragraphs.push({ type: 'paragraph', text: ch.description })
    }
    if (options.characters.categoryHeading) {
      paragraphs.push({ type: 'paragraph', text: t('Category'), heading: HeadingLevel.HEADING_3 })
    }
    if (options.characters.category) {
      const category = allCharacterCategories.find(
        (category) => String(category.id) === ch.categoryId
      )
      if (category) paragraphs.push({ type: 'paragraph', text: category.name })
    }
    if (options.characters.notesHeading) {
      paragraphs.push({ type: 'paragraph', text: t('Notes'), heading: HeadingLevel.HEADING_3 })
    }
    if (options.characters.notes) {
      paragraphs = [...paragraphs, { type: 'rce', data: ch.notes }]
    }
    if (options.characters.customAttributes) {
      paragraphs = [...paragraphs, { type: 'custom-atttributes', data: attributesSelector(ch.id) }]
    }
    if (options.characters.templates) {
      paragraphs = [...paragraphs, { type: 'templates', character: ch }]
    }
  })

  return paragraphs
}

export function interpret(paragraphs, images) {
  return paragraphs.flatMap(({ type, ...props }) => {
    switch (type) {
      case 'paragraph': {
        return [new Paragraph(props)]
      }
      case 'image-paragraph': {
        const imgData = images[props.imageId] && images[props.imageId].data
        if (imgData) {
          return [
            new Paragraph({
              children: [
                new ImageRun({
                  data: imgData,
                  transformation: {
                    width: 300,
                    height: 300,
                  },
                }),
              ],
            }),
          ]
        }
        return []
      }
      case 'rce': {
        return serialize(props.data)
      }
      case 'custom-atttributes': {
        return exportAttributes(props.data, HeadingLevel.HEADING_3)
      }
      case 'templates': {
        return exportItemTemplates(props.character, HeadingLevel.HEADING_3)
      }
      default: {
        return []
      }
    }
  })
}

function exportAttributes(attributes, headingLevel) {
  return (attributes || []).flatMap((ca) => {
    let paragraphs = []
    paragraphs.push(new Paragraph({ text: ca.name, heading: headingLevel }))
    if (ca.type == 'paragraph' && Array.isArray(ca.value)) {
      const attrParagraphs = serialize(ca.value)
      paragraphs = [...paragraphs, ...attrParagraphs]
    } else {
      paragraphs.push(new Paragraph({ text: ca.value }))
    }
    return paragraphs
  })
}
