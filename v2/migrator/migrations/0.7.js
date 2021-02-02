import { cloneDeep } from 'lodash'

export default function migrate(data) {
  if (data.file && data.file.version === '0.7.0') return data

  var obj = cloneDeep(data)

  // remove chapters ... yes again
  delete obj.chapters

  // remove chapter ids from scenes
  data.scenes.forEach((s) => {
    delete s.chapterId
  })

  return obj
}
