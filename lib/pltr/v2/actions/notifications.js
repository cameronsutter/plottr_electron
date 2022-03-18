import { SHOW_TOAST_NOTIFICATION } from '../constants/ActionTypes'

export function showToastNotification(visible, cardAction, newBookId) {
  return { type: SHOW_TOAST_NOTIFICATION, visible, cardAction, newBookId }
}
