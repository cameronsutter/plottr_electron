export const isEmpty = (children) => {
  // Bit hacky, but this should catch all the possible cases.
  return (
    children &&
    (children.length === 0 ||
      children[0].children.length === 0 ||
      (children[0].children.length === 1 && children[0].children[0].text === ''))
  )
}
