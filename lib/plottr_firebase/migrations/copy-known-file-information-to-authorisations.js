const fs = require('fs')
const admin = require('firebase-admin')
const readline = require('node:readline')
const { stdin, stdout } = require('node:process')

if (!admin.apps.length) {
  if (!process.env.FIREBASE_ENV || process.env.FIREBASE_ENV === '') {
    console.error(
      'No FIREBASE_ENV set.  Please set one and try again.  Options: "development", "preview" or "production".'
    )
    process.exit(1)
  } else if (process.env.FIREBASE_ENV === 'development') {
    const projectId = 'plottr-ci'
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
    admin.initializeApp({ projectId })
  } else if (process.env.FIREBASE_ENV === 'preview') {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  } else if (process.env.FIREBASE_ENV === 'production') {
    const serviceAccount = JSON.parse(process.env.FIREBASE_KEY)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  }
}

const main = (argv) => {
  const rl = readline.createInterface({ input: stdin, output: stdout })
  const userId = argv[2]
  console.log('User id: ' + userId)

  rl.question('Hit enter to continue...', () => {
    markDeletedAuthorisedDocumentsAsDeleted(userId)
  })
}

const authorisedProjects = (userId) => {
  const database = admin.firestore()

  return database
    .collection(`authorisation/${userId}/granted`)
    .get()
    .then((querySnapshot) => {
      const projects = []
      querySnapshot.forEach((doc) => {
        projects.push(doc.id)
      })
      return projects
    })
}

const allFiles = (userId) => {
  const database = admin.firestore()

  return authorisedProjects(userId).then((projects) => {
    return Promise.all(
      projects.map((id) => {
        return database
          .collection('file')
          .doc(id)
          .get()
          .then((document) => {
            if (document.exists) {
              return document.data()
            }
            return {
              exists: false
            }
          })
      })
    )
  })
}

const markDeletedAuthorisedDocumentsAsDeleted = (userId) => {
  const database = admin.firestore()

  return allFiles(userId)
    .then((files) => {
      return authorisedProjects(userId).then((authorisedProjects) => {
        return Promise.all(
          authorisedProjects.map((fileId) => {
            const correspondingFile = files.find((file) => {
              return file.id === fileId
            })
            if (correspondingFile) {
              const payload = {
                lastOpened: correspondingFile.lastOpened || correspondingFile.timeStamp || null,
                fileURL: `plottr://${correspondingFile.id}`,
                fileName: correspondingFile.fileName || 'Untitled',
              }
              console.log(
                `Adding ${JSON.stringify(payload)} to authorisation/${userId}/granted/${fileId}`
              )
              return database.doc(`authorisation/${userId}/granted/${fileId}`).update(payload)
            } else {
              console.log(`No file found for: authorisation/${userId}/granted/${fileId}`)
            }
            return false
          })
        )
      })
    })
    .catch((error) => {
      console.error(`ERROR: ${error.message}`, error)
      process.exit(1)
    })
    .finally(() => {
      process.exit(0)
    })
}

main(process.argv)
