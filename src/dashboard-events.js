export const openDashboard = () => {
  fireEvent('open-dashboard')
}

export const closeDashboard = () => {
  fireEvent('close-dashboard')
}

export const createBlankProj = () => {
  fireEvent('new-project')
}

export const createFromTemplate = () => {
  fireEvent('from-template')
}

export const openExistingProj = () => {
  fireEvent('open-existing')
}

function fireEvent(name) {
  const theEvent = new Event(name, { bubbles: true, cancelable: false })
  document.dispatchEvent(theEvent)
}
