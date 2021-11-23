import { remote } from 'electron'
import { migrateIfNeeded } from 'pltr/v2'

import { uploadExisting } from '../../files'
import extractImages from '../extract_images'
import { logger } from '../../logger'

const { app } = remote

const appVersion = app.getVersion()

export const uploadProject = (file, email, userId) => {
  return new Promise((resolve, reject) => {
    migrateIfNeeded(
      appVersion,
      file,
      file.file.fileName,
      null,
      (error, migrated, data) => {
        if (error) {
          logger.error('Error migrating file: ', error)
          reject(error)
          return
        }
        if (migrated) {
          logger.info(
            `File was migrated.  Migration history: ${data.file.appliedMigrations}.  Initial version: ${data.file.initialVersion}`
          )
        }
        extractImages(data, userId)
          .then((patchedData) => {
            return uploadExisting(email, userId, patchedData)
          })
          .then((result) => {
            logger.info('successful upload', file.file.fileName)
            resolve(result)
          })
          .catch((err) => {
            logger.error(file.file.fileName)
            logger.error(err)
            reject(err)
          })
      },
      logger
    )
  })
}
