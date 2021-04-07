import { v4 as uuid } from 'uuid'

// this function allows you to get a unique `testIds` object
// in any file. Any property off the `testIds` object will
// generate a unique test id to then be used in the dom
// but it's only done in test
export default function getTestIds() {
  if (process.env.NODE_ENV !== 'test') return {}

  let ids = new Map()
  let proxy = new Proxy(
    {},
    {
      get: function (obj, prop) {
        if (ids.has(prop) === false) {
          ids.set(prop, uuid())
        }
        return ids.get(prop)
      },
    }
  )
  return proxy
}
