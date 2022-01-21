export const isWindows = () => {
  return (navigator.platform || navigator.userAgentDate.platform || '')
    .toLowerCase()
    .match('windows')
}

export const isLinux = () => {
  return (navigator.platform || navigator.userAgentDate.platform || '').toLowerCase().match('linux')
}

export const isMacOS = () => {
  return (navigator.platform || navigator.userAgentDate.platform || '').toLowerCase().match('macos')
}
