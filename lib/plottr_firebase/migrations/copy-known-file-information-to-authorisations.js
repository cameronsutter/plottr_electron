const admin = require('firebase-admin')
const readline = require('node:readline')
const { stdin, stdout } = require('node:process')

const { logChange } = require('./log-change')
const { sequencePromises } = require('./util')

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

const RUN_DATE = new Date()

const main = (argv) => {
  const rl = readline.createInterface({ input: stdin, output: stdout })
  const userId = argv[2]
  if (userId) {
    console.log('Running for user id: ' + userId)
  } else {
    console.log('No user supplied running for all users.')
  }

  rl.question(
    'Is this the production run?\n(Only "Yes" -case sensitive- will be interpreted as affirmative): ',
    (response) => {
      const readOnlyMode = response !== 'Yes'
      console.log('Read only mode: ', readOnlyMode)
      rl.question('Please enter your userId: ', (executingUserId) => {
        checkUserId(executingUserId).then((proceed) => {
          if (proceed) {
            console.log('User exists.  Executing script.')
            const userIds = userId ? Promise.resolve([userId]) : allUserIds()
            userIds
              .then((uids) => {
                console.log(`Will run script for users with ids: ${JSON.stringify(uids, null, 2)}`)
                return sequencePromises(
                  uids.map((uid) => {
                    return () => {
                      console.log(`> ${uid}`)
                      return copyKnownFileInformationToAuthorisation(
                        uid,
                        executingUserId,
                        readOnlyMode
                      ).catch((error) => {
                        console.error(`Error executing change on ${uid}`, error)
                      })
                    }
                  })
                )
              })
              .then(() => {
                process.exit(0)
              })
          } else {
            process.exit(1)
          }
        })
      })
    }
  )
}

const allUserIds = () => {
  function iter(acc, nextPageToken) {
    return admin
      .auth()
      .listUsers(1000, nextPageToken)
      .then((listUsersResult) => {
        const nextUsers = listUsersResult.users.map((user) => {
          return user.uid
        })
        if (listUsersResult.pageToken) {
          return iter([...nextUsers, ...acc], listUsersResult.pageToken)
        } else {
          return acc
        }
      })
      .catch((error) => {
        console.log('Error listing users:', error)
      })
  }

  return iter([])
}

const checkUserId = (userId) => {
  return admin
    .auth()
    .getUser(userId)
    .catch((error) => {
      if (error.errorInfo.code === 'auth/user-not-found') {
        console.error('Executing user does not exist.  Please check the user id!')
        return false
      }

      return Promise.reject(error)
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
              return {
                ...document.data(),
                id: document.id,
              }
            }
            return {
              exists: false,
            }
          })
      })
    )
  })
}

const copyKnownFileInformationToAuthorisation = (userId, executingUserId, readOnly) => {
  const database = admin.firestore()
  const runTransactionWithAuditing = logChange(readOnly)(
    database,
    executingUserId,
    'copy-known-file-information-to-authorisations.js',
    RUN_DATE
  )

  return allFiles(userId)
    .then((files) => {
      return authorisedProjects(userId).then((authorisedProjects) => {
        return Promise.all(
          authorisedProjects.map((fileId) => {
            const correspondingFile = files.find((file) => {
              return file.id === fileId
            })
            if (correspondingFile) {
              const change = {
                lastOpened: correspondingFile.lastOpened || correspondingFile.timeStamp || null,
                fileURL: `plottr://${correspondingFile.id}`,
                fileName: correspondingFile.fileName || 'Untitled',
              }
              return database
                .doc(`authorisation/${userId}/granted/${fileId}`)
                .get()
                .then((ref) => ref.data())
                .then((oldRecord) => {
                  const newRecord = {
                    ...oldRecord,
                    ...change,
                  }
                  console.log(
                    `Adding ${JSON.stringify(
                      change,
                      null,
                      2
                    )} to authorisation/${userId}/granted/${fileId} to produce: ${JSON.stringify(
                      newRecord,
                      null,
                      2
                    )}`
                  )
                  return runTransactionWithAuditing(
                    userId,
                    fileId,
                    `authorisation/${userId}/granted`,
                    oldRecord,
                    newRecord
                  )
                })
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
    })
}

main(process.argv)
