export function focusIsEditable() {
  if (document.activeElement.tagName == 'INPUT') return true
  if (
    document.activeElement.dataset.slateEditor &&
    document.activeElement.dataset.slateEditor == 'true'
  )
    return true

  return false
}
