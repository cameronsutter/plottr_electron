import { SHOW_MESSAGE, SHOW_TOAST_NOTIFICATION, DISMISS_MESSAGE } from '../constants/ActionTypes'

export function showToastNotification(visible, cardAction, newBookId, lineAction) {
  return { type: SHOW_TOAST_NOTIFICATION, visible, cardAction, newBookId, lineAction }
}

export function showMessage(message) {
  return { type: SHOW_MESSAGE, message }
}

export function dismissMessage() {
  return { type: DISMISS_MESSAGE }
}
