import i18n from 'format-message'
import {
  createFolderBinderItem,
  createTextBinderItem,
  buildTagsString,
  buildTemplateProperties,
  buildDescriptionFromObject,
} from '../utils'
import { selectors } from 'pltr/v2'

const { placesSortedInBookSelector } = selectors

export default function exportPlaces(state, documentContents) {
  const { binderItem } = createFolderBinderItem(i18n('Places'))
  const places = placesSortedInBookSelector(state)
  places.forEach((place) => {
    const {
      // these attributes are not being used
      /* eslint-disable */
      cards,
      colors,
      id: placeId,
      imageId,
      noteIds,
      bookIds,
      /* eslint-enable */

      //used for the export
      name,
      tags,
      templates,
      ...placeProperties
    } = place
    const { id, binderItem: placeBinderItem } = createTextBinderItem(name)
    binderItem.Children.BinderItem.push(placeBinderItem)

    // handle tags
    placeProperties.Tags = buildTagsString(tags, state)

    // handle template properties
    Object.assign(placeProperties, buildTemplateProperties(templates))

    const description = buildDescriptionFromObject(placeProperties)
    documentContents[id] = {
      docTitle: i18n('Place: {name}', { name }),
      description,
    }
  })

  return binderItem
}
