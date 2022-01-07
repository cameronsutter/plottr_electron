import { t as i18n } from 'plottr_locales'
import {
  createFolderBinderItem,
  createTextBinderItem,
  buildTagsString,
  buildTemplateProperties,
  buildDescriptionFromObject,
} from '../utils'
import { selectors } from 'pltr/v2'

const { characterCategoriesSelector, charactersSortedInBookSelector } = selectors

export default function exportCharacters(state, documentContents, options) {
  const { binderItem } = createFolderBinderItem(i18n('Characters'))
  const characters = charactersSortedInBookSelector(state)
  const allCharacterCategories = Object.values(characterCategoriesSelector(state))
  characters.forEach((character) => {
    const {
      // these attributes are not being used
      /* eslint-disable */
      cards,
      color,
      id: characterId,
      imageId,
      noteIds,
      bookIds,
      /* eslint-enable */

      // used for the export
      name,
      categoryId,
      tags,
      templates,
      ...characterProperties
    } = character
    const { id, binderItem: characterBinderItem } = createTextBinderItem(name)
    binderItem.Children.BinderItem.push(characterBinderItem)

    // handle tags
    if (options.characters.tags) {
      characterProperties.Tags = buildTagsString(tags, state)
    }

    // handle categories
    if (options.characters.category) {
      if (categoryId != null) {
        const category = allCharacterCategories.find(
          (category) => String(category.id) == String(categoryId)
        )
        characterProperties.Category = category.name
      }
    }

    let description = buildDescriptionFromObject(characterProperties, options.characters)

    // handle template properties
    if (options.characters.templates) {
      description = [
        ...description,
        ...buildDescriptionFromObject(buildTemplateProperties(templates), true),
      ]
    }

    documentContents[id] = {
      body: {
        docTitle: options.characters.heading ? name : null,
        description,
      },
    }
  })
  return binderItem
}
