import { middlewares, ARRAY_KEYS } from 'pltr/v2'
import { overwrite, toFirestoreArray } from 'plottr_firebase'

const firebaseSync = (store) => (next) => (action) => {
  const file = store.getState().present && store.getState().present.file
  const isCloudFile = file && file.isCloudFile
  if (isCloudFile) {
    return middlewares.externalSync(overwrite, (key, data) => {
      return ARRAY_KEYS.indexOf(key) !== -1 ? toFirestoreArray(data) : data
    })(store)(next)(action)
  }
  return next(action)
}

export default firebaseSync
