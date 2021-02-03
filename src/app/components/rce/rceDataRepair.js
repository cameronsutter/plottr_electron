import log from 'electron-log'
import { cloneDeep } from 'lodash'
import { Text } from 'slate'

// This is only used for things that will cause rendering to fail
// Use Slate's normalizer for normal schema/structure normalizing

// @data: a Slate data structure
// returns a Slate data structure
export function rceDataRepair(data) {
  if (Array.isArray(data) === false) return data
  let slate = cloneDeep(data)

  try {
    walkRichContentTree(slate, (object) => {
      // repair children with numbered key attributes ("0", "1")
      if (object.children && !Array.isArray(object.children) && object.children['0']) {
        object.children = Object.values(object.children)
      }

      // elements (non-text nodes) should have children
      if (!Text.isText(object)) {
        if (!object.children || !object.children.length) {
          object.children = [{ text: '' }]
        }
      }
    })
  } catch (error) {
    log.error(error)
    return slate
  }

  return slate
}

function walkRichContentTree(richContent, callback) {
  richContent.forEach((o) => {
    callback(o)
    if (Array.isArray(o.children)) {
      walkRichContentTree(o.children, callback)
    }
  })
}
