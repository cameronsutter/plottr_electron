// IMPORTANT NOTE: Please don't import other selectors from this file.
// Use secondOrder and *ThirdOrder for your selector if it has other
// dependencies.

export const toastNotificationSelector = (state) => state.notifications.toast
export const messageSelector = (state) => state.notifications.message
