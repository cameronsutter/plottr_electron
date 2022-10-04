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

const deletedFiles = (userId) => {
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
              return {
                document: document.data(),
                exists: true,
              }
            }
            return {
              exists: false,
            }
          })
      })
    ).then((results) => {
      return results
        .filter(({ exists, document }) => {
          return exists && document.deleted
        })
        .map(({ document }) => document)
    })
  })
}

const markDeletedAuthorisedDocumentsAsDeleted = (userId) => {
  const database = admin.firestore()

  return deletedFiles(userId)
    .then((deletedFiles) => {
      return authorisedProjects(userId).then((authorisedProjects) => {
        return Promise.all(
          authorisedProjects.map((fileId) => {
            const fileIsDeleted = deletedFiles.some((file) => {
              return file.id === fileId
            })
            if (fileIsDeleted) {
              console.log(`Marking: authorisation/${userId}/granted/${fileId}`)
              return database
                .doc(`authorisation/${userId}/granted/${fileId}`)
                .update({ deleted: true })
            } else {
              console.log(`File isn't deleted: authorisation/${userId}/granted/${fileId}`)
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
