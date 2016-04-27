import _ from 'lodash'

export default function migrate (data) {
  var obj = _.clone(data)

  // add version
  obj.file.version = '0.5.0'

  obj.tags.forEach((t) => {
    t['color'] = null
  })

  // remove userOptions
  delete obj.userOptions

  return obj
}
