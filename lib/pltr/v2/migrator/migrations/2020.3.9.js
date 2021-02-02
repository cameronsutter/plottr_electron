import { cloneDeep } from 'lodash'

export default function migrate(data) {
  if (data.file && data.file.version === '2020.3.9') return data

  var obj = cloneDeep(data)

  // add images
  obj.images = obj.images || {}

  // add imageId to characters
  obj.characters.forEach((c) => {
    c.imageId = c.imageId || null
  })

  // add imageId to places
  obj.places.forEach((pl) => {
    pl.imageId = pl.imageId || null
  })

  // add imageId to cards
  obj.cards.forEach((c) => {
    c.imageId = c.imageId || null
  })

  // add imageId to notes
  obj.notes.forEach((n) => {
    n.imageId = n.imageId || null
  })

  return obj
}
