export const closeDashboard = () => {
  const closeDashbaordEvent = new Event('close-dashboard', { bubbles: true, cancelable: false })
  document.dispatchEvent(closeDashbaordEvent)
}
