const Store = require('electron-store')

const TEMPLATES_PATH = process.env.NODE_ENV == 'development' ? 'templates_dev' : 'templates'
const templateStore = new Store({name: TEMPLATES_PATH})
const TEMPLATES_ROOT = 'templates'

export default function listTemplates (type) {
  const templatesById = templateStore.get(TEMPLATES_ROOT)
  if (!templatesById) return []
  if (!type) return Object.values(templatesById)

  const ids = Object.keys(templatesById)
  return ids.reduce((acc, id) => {
    if (templatesById[id].type === type) acc.push(templatesById[id])
    return acc
  }, [])
}