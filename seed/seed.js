const admin = require('firebase-admin')
const files = require('./files.json')

const projectId = 'plottr-ci'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
admin.initializeApp({ projectId })

const database = admin.firestore()

function seedDatabase() {
  try {
    const result = createExampleFiles()
    console.log('database seed was successful')
    return result
  } catch (error) {
    console.log(error, 'database seed failed')
    throw new error(error)
  }
}

function createExampleFiles() {
  return Promise.all(
    files.map((record) => {
      return database
        .collection('file')
        .add(record.file)
        .then((documentReference) => {
          const id = documentReference.id
          return Promise.all(
            Object.keys(record).map((key) => {
              if (key === 'file') return
              database
                .collection(key)
                .doc(id)
                .set({
                  ...record[key],
                  fileId: id,
                })
            })
          )
        })
    })
  )
}

function createTestUser() {
  admin
    .auth()
    .createUser({ email: 'test@test.com', password: 'tester' })
    .then(() => {
      console.log('Created user test@test.com')
      return admin
        .auth()
        .getUserByEmail('test@test.com')
        .then((user) => {
          return admin.auth().setCustomUserClaims(user.uid, { admin: true })
        })
    })
    .then(() => {
      admin
        .auth()
        .createUser({ email: 'test2@test.com', password: 'tester' })
        .then(() => {
          console.log('Created user test2@test.com')
          return admin
            .auth()
            .getUserByEmail('test2@test.com')
            .then((user) => {
              return admin.auth().setCustomUserClaims(user.uid, { admin: true })
            })
        })
    })
}

seedDatabase().then((results) => {
  createTestUser()
})
