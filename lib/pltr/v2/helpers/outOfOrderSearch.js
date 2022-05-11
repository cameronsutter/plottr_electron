export const outOfOrderSearch = (terms, str) => {
  return terms.every((term) => {
    return str.match(term)
  })
}
