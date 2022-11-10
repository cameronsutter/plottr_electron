import { t } from 'plottr_locales'
import { Paragraph, AlignmentType, HeadingLevel, ImageRun } from 'docx'
import { selectors } from 'pltr/v2'

import exportItemTemplates from './itemTemplates'
import { serialize } from './to_word'

const { characterCategoriesSelector } = selectors

export default function exportCharacters(state, options) {
  let children = [new Paragraph({ text: '', pageBreakBefore: true })]
  const allCharacterCategories = Object.values(characterCategoriesSelector(state))

  if (options.characters.heading) {
    children.push(
      new Paragraph({
        text: t('Characters'),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      })
    )
  }

  const bookToExport = selectors.currentTimelineSelector(state)
  const allCharacters = selectors.allDisplayedCharactersForCurrentBookSelector(
    state,
    null,
    bookToExport
  )
  const attributesSelector = (characterId) =>
    selectors.characterAttributesSelector(state, characterId, bookToExport)
  const images = selectors.imagesSelector(state)

  const paragraphs = characters(
    allCharacters,
    attributesSelector,
    images,
    options,
    allCharacterCategories
  )

  return [{ children: children.concat(paragraphs) }]
}

export function characterDataExportDirectives(state, options) {
  if (!options.characters.export) {
    return []
  }

  const allCharacterCategories = Object.values(characterCategoriesSelector(state))
  let paragraphs = []

  const showBookTabs = selectors.showBookTabsSelector(state)
  const bookToExport = !showBookTabs ? 'all' : selectors.currentTimelineSelector(state)
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
      paragraphs = [...paragraphs, { type: 'rce', data: ch.nodes }]
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
          })
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

// exportAttributes(attributesSelector(ch.id), HeadingLevel.HEADING_3)

function exportAttributes(attributes, headingLevel) {
  return (attributes || []).flatMap((ca) => {
    let paragraphs = []
    paragraphs.push(new Paragraph({ text: ca.name, heading: headingLevel }))
    if (ca.type == 'paragraph') {
      const attrParagraphs = serialize(ca.value)
      paragraphs = [...paragraphs, ...attrParagraphs]
    } else {
      paragraphs.push(new Paragraph({ text: ca.value }))
    }
    return paragraphs
  })
}

function characters(characters, attributesSelector, images, options, allCharacterCategories) {
  let paragraphs = []
  characters.forEach((ch) => {
    paragraphs.push(new Paragraph({ text: '' }))
    paragraphs.push(new Paragraph({ text: ch.name, heading: HeadingLevel.HEADING_2 }))
    if (options.characters.images && ch.imageId) {
      const imgData = images[ch.imageId] && images[ch.imageId].data
      if (imgData) {
        paragraphs.push(
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
          })
        )
      }
    }
    if (options.characters.descriptionHeading) {
      paragraphs.push(new Paragraph({ text: t('Description'), heading: HeadingLevel.HEADING_3 }))
    }
    if (options.characters.description) {
      paragraphs.push(new Paragraph({ text: ch.description }))
    }
    if (options.characters.categoryHeading) {
      paragraphs.push(new Paragraph({ text: t('Category'), heading: HeadingLevel.HEADING_3 }))
    }
    if (options.characters.category) {
      const category = allCharacterCategories.find(
        (category) => String(category.id) === ch.categoryId
      )
      if (category) paragraphs.push(new Paragraph({ text: category.name }))
    }
    if (options.characters.notesHeading) {
      paragraphs.push(new Paragraph({ text: t('Notes'), heading: HeadingLevel.HEADING_3 }))
    }
    if (options.characters.notes) {
      paragraphs = [...paragraphs, ...serialize(ch.notes)]
    }
    if (options.characters.customAttributes) {
      paragraphs = [
        ...paragraphs,
        ...exportAttributes(attributesSelector(ch.id), HeadingLevel.HEADING_3),
      ]
    }
    if (options.characters.templates) {
      paragraphs = [...paragraphs, ...exportItemTemplates(ch, HeadingLevel.HEADING_3)]
    }
  })

  return paragraphs
}
