// Source: https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex#6969486
const escapeRegex = (searchTerm) => {
  return searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const outOfOrderSearch = (terms, str) => {
  return terms.every((term) => {
    return str.match(escapeRegex(term))
  })
}
