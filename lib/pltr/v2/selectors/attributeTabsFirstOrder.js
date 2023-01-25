export const showBookTabs = (bookIds, characters) => {
  const aCharacterHasABook = characters.some((character) => {
    return character.bookIds && character.bookIds.length > 0
  })

  return bookIds.length > 1 && aCharacterHasABook
}
