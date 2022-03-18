import { t } from 'plottr_locales'
import { Paragraph, AlignmentType, HeadingLevel, Media } from 'docx'
import exportCustomAttributes from './customAttributes'
import exportItemTemplates from './itemTemplates'
import { selectors, slate } from 'pltr/v2'

const { serialize } = slate.word
const { characterCategoriesSelector } = selectors

export default function exportCharacters(state, doc, options) {
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
    doc,
    options,
    allCharacterCategories
  )

  return { children: children.concat(paragraphs) }
}

function characters(characters, customAttributes, images, doc, options, allCharacterCategories) {
  let paragraphs = []
  characters.forEach((ch) => {
    paragraphs.push(new Paragraph(''))
    paragraphs.push(new Paragraph({ text: ch.name, heading: HeadingLevel.HEADING_2 }))
    if (options.characters.images && ch.imageId) {
      const imgData = images[ch.imageId] && images[ch.imageId].data
      if (imgData) {
        const image = Media.addImage(
          doc,
          Buffer.from(imgData.replace('data:image/jpeg;base64,', ''), 'base64')
        )
        paragraphs.push(new Paragraph({ children: [image] }))
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
      paragraphs = [...paragraphs, ...serialize(ch.notes, doc)]
    }
    if (options.characters.customAttributes) {
      paragraphs = [
        ...paragraphs,
        ...exportCustomAttributes(ch, customAttributes, HeadingLevel.HEADING_3, doc),
      ]
    }
    if (options.characters.templates) {
      paragraphs = [...paragraphs, ...exportItemTemplates(ch, HeadingLevel.HEADING_3, doc)]
    }
  })

  return paragraphs
}
