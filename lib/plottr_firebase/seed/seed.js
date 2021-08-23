const admin = require('firebase-admin')
const firebase = require('firebase/app')
const files = require('./files.json')
require('firebase/auth')

const projectId = 'plottr-ci'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
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
  const firebaseConfig = {
    apiKey: 'AIzaSyAwvdLWqVoyhEXbT26aTx0HL_qybstxLFY',
    authDomain: 'plottr-ci.firebaseapp.com',
    projectId: 'plottr-ci',
    storageBucket: 'plottr-ci.appspot.com',
    messagingSenderId: '733541501381',
    appId: '1:733541501381:web:66827ee4e4cbe58ac8e3ac',
    measurementId: 'G-XHGVVN7KYL',
  }
  firebase.initializeApp(firebaseConfig)
  const auth = firebase.auth()
  auth.useEmulator('http://plottr.local:9099')
  firebase
    .auth()
    .createUserWithEmailAndPassword('test@test.com', 'tester')
    .then(() => {
      console.log('Created user test@test.com')
    })
}

seedDatabase().then((results) => {
  createTestUser()
})
