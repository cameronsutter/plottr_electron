import { createSelector } from 'reselect'

// Other selector dependencies
import { allBookIdsSelector } from './booksFirstOrder'
import { uiSelector } from './secondOrder'

const cardDialogSelector = createSelector(uiSelector, ({ cardDialog }) => {
  return cardDialog
})
const bookDialogSelector = createSelector(uiSelector, ({ bookDialog }) => {
  return bookDialog
})

export const cardDialogCardIdSelector = createSelector(cardDialogSelector, (cardDialog) => {
  return cardDialog?.cardId
})
export const cardDialogLineIdSelector = createSelector(cardDialogSelector, (cardDialog) => {
  return cardDialog?.lineId
})
export const cardDialogBeatIdSelector = createSelector(cardDialogSelector, (cardDialog) => {
  return cardDialog?.beatId
})
export const isCardDialogVisibleSelector = createSelector(cardDialogSelector, (cardDialog) => {
  return cardDialog?.isOpen
})

export const isBookDialogVisibleSelector = createSelector(bookDialogSelector, (bookDialog) => {
  return bookDialog?.isOpen
})

export const bookDialogBookIdSelector = createSelector(bookDialogSelector, (bookDialog) => {
  return bookDialog?.bookId
})

export const bookNumberSelector = createSelector(
  allBookIdsSelector,
  bookDialogBookIdSelector,
  (allBookIds, bookDialogBookId) => {
    if (bookDialogBookId) {
      return allBookIds.indexOf(bookDialogBookId) + 1
    }

    return allBookIds.length + 1
  }
)

export const outlineScrollPositionSelector = createSelector(
  uiSelector,
  ({ outlineScrollPosition }) => outlineScrollPosition
)
