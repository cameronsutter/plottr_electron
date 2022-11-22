import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'
import { helpers } from 'pltr/v2'

import ProgressBar from '../../../ProgressBar'
import FailedUploads from './FailedUploads'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import { checkDependencies } from '../../../checkDependencies'

const typeName = {
  project: t('Project'),
  template: t('Template'),
}

const UploadingConnector = (connector) => {
  const {
    platform: {
      file: { doesFileExist, readFileSync, removeFromKnownFiles },
      firebase: { saveCustomTemplate, uploadExisting, fetchFiles },
      extractImages,
      log,
      appVersion,
      isDevelopment,
    },
    pltr: { migrateIfNeeded },
  } = connector
  checkDependencies({
    doesFileExist,
    readFileSync,
    removeFromKnownFiles,
    saveCustomTemplate,
    uploadExisting,
    fetchFiles,
    log,
    extractImages,
    appVersion,
    isDevelopment,
  })

  const Uploading = ({ nextStep, projects, templates, userId, emailAddress }) => {
    const [maxItems, setMaxItems] = useState(100)
    const [currentProgress, setCurrentProgress] = useState(0)
    const [currentObj, setCurrentObj] = useState(null)
    const [done, setDone] = useState(false)
    const failedProjects = useRef([])
    const failedTemplates = useRef([])
    const failed = useRef(false)

    useEffect(() => {
      if (!userId || !emailAddress) return
      if (currentProgress > 0) return // don't rerun this after it's started
      const toUpload = []
      if (projects) {
        projects.forEach((pr) => {
          toUpload.push({
            type: 'project',
            fileURL: pr.fileURL,
            name: pr.fileName,
          })
        })
      }
      if (templates) {
        templates.forEach((tm) => {
          toUpload.push({ type: 'template', id: tm.id, data: tm, name: tm.name })
        })
      }
      // beging uploading
      setCurrentProgress(1)
      setMaxItems(toUpload.length)
      const allPromises = toUpload.reduce((p, obj, idx) => {
        return p.then(() => {
          const currentObject = `${typeName[obj.type]}: ${obj.name}`
          setCurrentObj(currentObject)
          setCurrentProgress(idx + 1)
          log.info(typeName[obj.type], 'uploading ...', obj.name)
          if (obj.type == 'project') {
            // upload project
            if (isDevelopment) {
              return new Promise((resolve, _reject) => setTimeout(() => resolve(true), 200))
            }
            return uploadProject(obj).catch((error) => {
              log.error(`Error uploading project: ${currentObject}`)
              failedProjects.current.push(obj.name)
              failed.current = true
              return 'Failed'
            })
          } else {
            // upload template
            if (isDevelopment) {
              return new Promise((resolve, _reject) => setTimeout(() => resolve(true), 200))
            }
            return saveCustomTemplate(userId, obj.data).catch((error) => {
              log.error(`Failed to upload template: ${currentObject}`, error)
              failedTemplates.current.push(obj.name)
              failed.current = true
              return 'Failed'
            })
          }
        })
      }, Promise.resolve())
      allPromises.then(() => {
        fetchFiles(userId).then(() => {
          // done! Go to the next step
          setCurrentObj(t('Done!'))
          setDone(true)
          if (failed.current) {
            return
          }
          setTimeout(nextStep, 1500)
        })
      })
    }, [userId, emailAddress])

    const uploadProject = (projObj) => {
      // read file
      if (doesFileExist(projObj.fileURL)) {
        return appVersion().then((version) => {
          return new Promise((resolve, reject) => {
            let file = null
            try {
              // FIXME: we can read files via the socket server now.  We
              // don't want to depend on FS from the renderer because we
              // want to eventually sandbox the renderer.
              file = JSON.parse(readFileSync(helpers.file.withoutProtocol(projObj.fileURL)))
            } catch (error) {
              log.error(`Error uploading file at path ${projObj.fileURL}`, error)
              reject(error)
              return
            }
            if (!file) {
              reject(new Error(`After reading ${projObj.fileURL}, it was null!?`))
              return
            }
            const fileName = file.file.fileName || projObj.name
            const fileURL = projObj.fileURL
            // migrate if needed
            migrateIfNeeded(
              version,
              file,
              fileURL,
              null,
              (error, migrated, data) => {
                if (error) {
                  log.error('Error migrating file: ', error)
                  reject(error)
                  return
                }
                if (migrated) {
                  log.info(
                    `File was migrated.  Migration history: ${data.file.appliedMigrations}.  Initial version: ${data.file.initialVersion}`
                  )
                }
                extractImages(data, userId)
                  .then((patchedData) => {
                    return uploadExisting(emailAddress, userId, {
                      ...patchedData,
                      file: { ...patchedData.file, fileName },
                    })
                  })
                  .then((result) => {
                    log.info('successful upload', fileName)
                    removeFromKnownFiles(projObj.fileURL)
                    resolve(result)
                  })
                  .catch((err) => {
                    log.error(fileName)
                    log.error(err)
                    reject(err)
                  })
              },
              log
            )
          })
        })
      }
      return Promise.reject(new Error(`Couldn't find the file at path: ${projObj.fileURL}`))
    }

    if (failed.current && done) {
      return (
        <StepBody>
          <FailedUploads
            nextStep={nextStep}
            failedTemplates={failedTemplates.current}
            failedProjects={failedProjects.current}
          />
        </StepBody>
      )
    }

    return (
      <>
        <StepHeader>
          <h2>{t('Uploading...')}</h2>
        </StepHeader>
        <StepBody>
          <ProgressBar
            now={currentProgress}
            max={maxItems}
            label={`${currentProgress}/${maxItems}`}
            bsStyle="success"
            striped
            active
          />
        </StepBody>
        <StepFooter>
          <p className="large-text">{currentObj}</p>
        </StepFooter>
      </>
    )
  }

  Uploading.propTypes = {
    nextStep: PropTypes.func,
    projects: PropTypes.array,
    templates: PropTypes.array,
    userId: PropTypes.string,
    emailAddress: PropTypes.string,
    hasCurrentProLicense: PropTypes.bool,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(
      (state) => ({
        userId: selectors.userIdSelector(state.present),
        emailAddress: selectors.emailAddressSelector(state.present),
        hasCurrentProLicense: selectors.hasProSelector(state.present),
      }),
      {}
    )(Uploading)
  }

  throw new Error('Could not connect Uploading')
}

export default UploadingConnector
