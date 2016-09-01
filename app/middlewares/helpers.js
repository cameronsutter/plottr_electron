export default function storageKey (fileName) {
  let index = fileName.lastIndexOf('/') + 1
  let name = fileName.substr(index).replace(' ', '_').replace('.plottr', '')
  return `history-${name}`
}
