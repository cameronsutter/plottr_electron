export function storageKey(fileName) {
  let index = fileName.lastIndexOf('/') + 1
  let name = fileName.substr(index).replace(/\s/g, '_').replace('.pltr', '')
  return `history-${name}`
}

export function preventLeaveOnHotlink () {
  let externalLinks = document.querySelectorAll(`[data-slate-node="element"]`)
  externalLinks.forEach(element => element.setAttribute('target', '_blank'))
}