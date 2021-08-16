export const cardDescriptionEditorPath = (cardId) => `cards/${cardId}/description`
export const cardCustomAttributeEditorPath = (cardId, attributeName) =>
  `cards/${cardId}/customAttributes/${attributeName}`
export const cardTemplateAttributeEditorPath = (cardId, templateId, attributeName) =>
  `cards/${cardId}/templates/${templateId}/${attributeName}`

export const noteContentEditorPath = (noteId) => `notes/${noteId}/content`
export const noteCustomAttributeEditorPath = (noteId, attributeName) =>
  `cards/${noteId}/customAttributes/${attributeName}`
export const noteTemplateAttributeEditorPath = (noteId, templateId, attributeName) =>
  `cards/${noteId}/templates/${templateId}/${attributeName}`

export const characterNotesEditorPath = (characterId) => `characters/${characterId}/notes`
export const characterCustomAttributeEditorPath = (characterId, attributeName) =>
  `characters/${characterId}/customAttributes/${attributeName}`
export const characterTemplateAttributeEditorPath = (characterId, templateId, attributeName) =>
  `characters/${characterId}/templates/${templateId}/${attributeName}`

export const placeNotesEditorPath = (placeId) => `places/${placeId}/notes`
export const placeCustomAttributeEditorPath = (placeId, attributeName) =>
  `places/${placeId}/customAttributes/${attributeName}`
export const placeTemplateAttributeEditorPath = (placeId, templateId, attributeName) =>
  `places/${placeId}/templates/${templateId}/${attributeName}`

export const attrIfPresent = (attrName, value) =>
  value || value === ''
    ? {
        [attrName]: value,
      }
    : {}

export const editorMetadataIfPresent = (editorPath, selection) => {
  if (editorPath && selection) {
    return {
      editorMetadata: {
        editorPath,
        selection,
      },
    }
  }

  return {}
}
