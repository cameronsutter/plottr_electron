// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

export const showBookTabs = (bookIds, characters) => {
  const aCharacterHasABook = characters.some((character) => {
    return character.bookIds && character.bookIds.length > 0
  })

  return bookIds.length > 1 && aCharacterHasABook
}
