import { t } from 'plottr_locales'
import { Paragraph, AlignmentType, HeadingLevel, ImageRun } from 'docx'
import exportCustomAttributes from './customAttributes'
import exportItemTemplates from './itemTemplates'
import { selectors, slate } from 'pltr/v2'

const { serialize } = slate.word
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

  const paragraphs = characters(
    state.characters,
    state.customAttributes['characters'],
    state.images,
    options,
    allCharacterCategories
  )

  return [{ children: children.concat(paragraphs) }]
}

function characters(characters, customAttributes, images, options, allCharacterCategories) {
  let paragraphs = []
  characters.forEach((ch) => {
    paragraphs.push(new Paragraph(''))
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
      paragraphs.push(new Paragraph(ch.description))
    }
    if (options.characters.categoryHeading) {
      paragraphs.push(new Paragraph({ text: t('Category'), heading: HeadingLevel.HEADING_3 }))
    }
    if (options.characters.category) {
      const category = allCharacterCategories.find(
        (category) => String(category.id) === ch.categoryId
      )
      if (category) paragraphs.push(new Paragraph(category.name))
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
        ...exportCustomAttributes(ch, customAttributes, HeadingLevel.HEADING_3),
      ]
    }
    if (options.characters.templates) {
      paragraphs = [...paragraphs, ...exportItemTemplates(ch, HeadingLevel.HEADING_3)]
    }
  })

  return paragraphs
}
