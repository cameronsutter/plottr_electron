export const isWindows = () => {
  return (navigator.platform || navigator.userAgentData.platform || '')
    .toLowerCase()
    .match('windows')
}

export const isLinux = () => {
  return (navigator.platform || navigator.userAgentData.platform || '').toLowerCase().match('linux')
}

export const isMacOS = () => {
  return (navigator.platform || navigator.userAgentData.platform || '').toLowerCase().match('macos')
}
