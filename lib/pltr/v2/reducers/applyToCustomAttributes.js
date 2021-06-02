/**
 * Produce a new object in which a function is applied to all of the
 * custom attributes of a particular type.
 */
export const applyToCustomAttributes = (object, func, customAttributes, customAttributeType) => {
  if (!customAttributes) return object

  const customAttributeValues = customAttributes.reduce((attributes, { name, type }) => {
    if (type === customAttributeType && object[name]) {
      return {
        ...attributes,
        [name]: func(object[name]),
      }
    }
    return attributes
  }, {})
  return {
    ...object,
    ...customAttributeValues,
  }
}
