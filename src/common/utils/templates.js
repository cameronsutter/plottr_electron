const Store = require('electron-store')

const TEMPLATES_PATH = 'templates'
const templateStore = new Store({name: TEMPLATES_PATH})
const TEMPLATES_ROOT = 'templates'

export default function listTemplates (type) {
  const templatesById = templateStore.get(TEMPLATES_ROOT)
  if (!type) return Object.values(templatesById)

  const ids = Object.keys(templatesById)
  return ids.reduce((acc, id) => {
    if (templatesById[id].type === type) acc.push(templatesById[id])
    return acc
  }, [])
}