// you can change a paragraph type back to text if:
// 1. It has no value
// 2. It is a string
// 3. It's value is the same as RCE_INITIAL_VALUE
// 4. It's value is an empty paragraph
// Otherwise, a paragraph type can not be changed back
export function hasNoLegacyValue(item, attr) {
  const val = item[attr]
  if (!val) return true
  if (typeof val === 'string') return true

  if (!val.length) return true
  if (val.length > 1) return false // more than 1 paragraph
  if (val[0].children) {
    if (val[0].children.length > 1) return false // more than 1 text node
    if (val[0].children[0].text == '') return true // no text
  }
  return false
}

export const noEntityHasLegacyAttributeBound = (entities, attrs) => {
  return attrs.reduce((acc, attr) => {
    if (attr.type == 'text') {
      acc.push(attr.name)
      return acc
    }

    const changeable = entities.every((ch) => hasNoLegacyValue(ch, attr.name))
    if (changeable) acc.push(attr.name)
    return acc
  }, [])
}

// you can change a paragraph type back to text if:
// 1. It has no value
// 2. It is a string
// 3. It's value is the same as RCE_INITIAL_VALUE
// 4. It's value is an empty paragraph
// Otherwise, a paragraph type can not be changed back
export function hasNoValue(item, id) {
  const attributeValues = item.attributes || []
  const val = attributeValues.find((item) => {
    return item.id === id
  })?.value
  if (!val) return true
  if (typeof val === 'string') return true

  if (!val.length) return true
  if (val.length > 1) return false // more than 1 paragraph
  if (val[0].children.length > 1) return false // more than 1 text node
  if (val[0].children[0].text == '') return true // no text
  return false
}

export const noEntityHasAttributeBound = (entities, attrs) => {
  return attrs.reduce((acc, attr) => {
    if (attr.type === 'base-attribute') {
      return acc
    }

    if (attr.type == 'text') {
      acc.push(attr.name)
      return acc
    }

    const changeable = entities.every((ch) => hasNoValue(ch, attr.id))
    if (changeable) acc.push(attr.name)
    return acc
  }, [])
}
