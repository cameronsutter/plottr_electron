import { cloneDeep } from 'lodash'
import { shell } from 'electron'
import { t as i18n } from 'plottr_locales'
import binderItem from './binderItem.json'
import bareScrivx from './bare_scrivx.json'
import { selectors } from 'pltr/v2'

const { allTagsSelector } = selectors

// RTF documents can not properly render characters that are represented by unicode values
// greater than 255. As such we must convert any unicode characters into the proper RTF
// escape sequences to render them properly
export function convertUnicode(str) {
  let converted = ''
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i)
    // These checks are per this documentation, though for char codes less than 255,
    // they don't seem to need to have their "rtf escape" used and they work as plain txt
    // https://www.oreilly.com/library/view/rtf-pocket-guide/9781449302047/ch01.html#unicode_in_rtf
    if (charCode < 255) {
      converted += str[i]
    } else if (charCode < 32768) {
      converted += `\\uc1\\u${charCode}*`
    } else {
      converted += `\\uc1\\u${charCode - 65536}*`
    }
  }

  return converted
}

const binderPlacements = {
  main: 0,
  research: 1,
  trash: 2,
}
// During an export we must add BinderItems that we create to the scrivx document
// See bare_scrivx.json for base structure. We can add to one of the three existing
// BinderItems defined by `binderPlacements`
export function addToScrivx(scrivx, binderItems, place) {
  const index = binderPlacements[place]
  if (Array.isArray(binderItems)) {
    scrivx.ScrivenerProject.Binder.BinderItem[index].Children.BinderItem.push(...binderItems)
  } else {
    scrivx.ScrivenerProject.Binder.BinderItem[index].Children.BinderItem.push(binderItems)
  }
  return scrivx
}

// A character/place has an array of tag ids associated with it
// This method will get the titles of each of the tags associated with
// the object and return them as a comma delimited string
export function buildTagsString(tags, state) {
  const allTags = allTagsSelector(state)
  return tags
    .map((tagId) => allTags.find(({ id }) => id === tagId))
    .filter(Boolean)
    .map(({ title }) => title)
    .join(', ')
}

// When a character is created from a template, it gets all of the template
// attributes attached to its object. This method turns any template attribute
// attached to a character into a single object where the key is the attribute
// name and the value is the value the user entered for that attribute
export function buildTemplateProperties(templates) {
  return templates.reduce((acc, { attributes }) => {
    attributes.forEach((attribute) => (acc[attribute.name] = attribute.value))
    return acc
  }, {})
}

// id starts at 2 because the base_scrivx.json already uses ids
// 0, 1, and 2 and the first thing the createBinderItem functions do
// is increment the id
let nextId = 2
export function resetId() {
  nextId = 2
}

// convenience method for creating a folder BinderItem
export function createFolderBinderItem(title) {
  nextId++
  let data = cloneDeep(binderItem)
  data['_attributes']['ID'] = nextId
  data['_attributes']['Type'] = 'Folder'
  data['Title']['_text'] = title
  data['Children'] = { BinderItem: [] }
  return {
    id: nextId,
    binderItem: data,
  }
}

// convenience method for creating a text binder item
export function createTextBinderItem(text) {
  nextId++
  let data = cloneDeep(binderItem)
  data['_attributes']['ID'] = nextId
  data['Title']['_text'] = text
  return {
    id: nextId,
    binderItem: data,
  }
}

// characters, places, and notes all have a number of fields that a user can enter
// to describe the object. We want to include all of those fields in the RTF document
// that we create for the object. This function takes an object of key value pairs
// and generates a rich text document where the keys are headings and the values are
// paragraphs that can then be used to create a RTF document

// NOTE: in this case 'options' is only the lowest level object
// so instead of options.notes.descriptionHeading, it is options.descriptionHeading
export function buildDescriptionFromObject(object, options) {
  const description = []
  for (const [key, value] of Object.entries(object)) {
    // if the user hasn't input a value we won't include it
    // for rich content the check is a bit more involved

    if (isPropertyEmpty(value)) {
      continue
    }

    if (key === 'description' && (options.descriptionHeading || options === true)) {
      description.push({
        type: 'heading-two',
        children: [{ text: i18n('Description') }],
      })
    }

    if (key === 'notes' && (options.notesHeading || options === true)) {
      description.push({
        type: 'heading-two',
        children: [{ text: i18n('Notes') }],
      })
    }

    if (key === 'Tags' && (options.tags || options === true)) {
      description.push({
        type: 'heading-two',
        children: [{ text: key }],
      })
    }

    if (
      key !== 'description' &&
      key !== 'notes' &&
      key !== 'Tags' &&
      (options.customAttributes || options === true)
    ) {
      description.push({
        type: 'heading-two',
        children: [{ text: key }],
      })
    }

    if (
      (key === 'description' && options.description) ||
      (key === 'notes' && options.notes) ||
      (key === 'Tags' && options.tags) ||
      options.customAttributes ||
      options === true
    ) {
      if (typeof value === 'string') {
        description.push({
          type: 'paragraph',
          children: [{ text: value }],
        })
      } else {
        description.push(...value)
      }
    }
  }
  return description
}

// this function checks if a value from building a description is empty
// RichContent has a few gotchas around what is considered "empty"
export function isPropertyEmpty(property) {
  if (!property) return true

  // Rich content is an array
  const isRichContent = Array.isArray(property)

  // If it isn't rich content and it's not empty then it has a value
  if (!isRichContent) return false

  // If the array has more than one item it's not empty
  if (property.length > 1) return false

  // OLD: This is to account for old pltr files
  // if (property[0].type == null) return true

  // NEW: new files will have an empty paragraph
  if (
    property[0] &&
    property[0].type === 'paragraph' &&
    property[0].children.length === 1 &&
    property[0].children[0].text === ''
  )
    return true

  return false
}

export function remove(exportPath) {
  shell.moveItemToTrash(exportPath)
}

// This function will create a copy of the bare_scrivx.json to start
// a new export. We also must reset the nextId as part of starting a
// new export
export function startNewScrivx() {
  const scrivx = cloneDeep(bareScrivx)
  scrivx.ScrivenerProject.Binder.BinderItem[0].Title._text = i18n('Manuscript')
  scrivx.ScrivenerProject.Binder.BinderItem[1].Title._text = i18n('Notes')
  scrivx.ScrivenerProject.Binder.BinderItem[2].Title._text = i18n('Trash')
  resetId()
  return scrivx
}
