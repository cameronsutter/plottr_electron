export const closeDashboard = () => {
  const closeDashboardEvent = new Event('close-dashboard', { bubbles: true, cancelable: false })
  document.dispatchEvent(closeDashboardEvent)
}
