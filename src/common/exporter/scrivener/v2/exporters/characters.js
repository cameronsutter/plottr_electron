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

export default function exportCharacters(state, documentContents) {
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
    characterProperties.Tags = buildTagsString(tags, state)

    // handle categories
    if (categoryId != null) {
      const category = allCharacterCategories.find((category) => String(category.id) === categoryId)
      characterProperties.Category = category.name
    }

    // handle template properties
    Object.assign(characterProperties, buildTemplateProperties(templates))

    const description = buildDescriptionFromObject(characterProperties)
    documentContents[id] = {
      docTitle: i18n('Character: {name}', { name }),
      description,
    }
  })
  return binderItem
}
