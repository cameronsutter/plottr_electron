import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'

import { ProgressBar } from 'react-bootstrap'
import { t } from 'plottr_locales'

import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import { checkDependencies } from '../../../checkDependencies'

const typeName = {
  project: t('Project'),
  template: t('Template'),
}

const UploadingConnector = (connector) => {
  const {
    platform: {
      file: { basename, doesFileExist, readFileSync, removeFromKnownFiles },
      firebase: { saveCustomTemplate, uploadExisting, fetchFiles },
      extractImages,
      log,
      useSettingsInfo,
      appVersion,
      isDevelopment,
    },
    pltr: { migrateIfNeeded },
  } = connector
  checkDependencies({
    basename,
    doesFileExist,
    readFileSync,
    removeFromKnownFiles,
    saveCustomTemplate,
    uploadExisting,
    fetchFiles,
    log,
    extractImages,
    useSettingsInfo,
    appVersion,
    isDevelopment,
  })

  const Uploading = ({ nextStep, projects, templates }) => {
    const [settings] = useSettingsInfo(false)
    const [maxItems, setMaxItems] = useState(100)
    const [currentProgress, setCurrentProgress] = useState(0)
    const [currentObj, setCurrentObj] = useState(null)

    useEffect(() => {
      if (!settings.user || !settings.user.id) return
      if (!settings.user || !settings.user.email) return
      if (currentProgress > 0) return // don't rerun this after it's started
      const toUpload = []
      projects.forEach((pr) => {
        toUpload.push({ type: 'project', path: pr.path, name: basename(pr.path), id: pr.id })
      })
      templates.forEach((tm) => {
        toUpload.push({ type: 'template', id: tm.id, data: tm, name: tm.name })
      })
      // beging uploading
      setCurrentProgress(1)
      setMaxItems(toUpload.length)
      const allPromises = toUpload.reduce((p, obj, idx) => {
        return p.then(() => {
          setCurrentObj(`${typeName[obj.type]}: ${obj.name}`)
          setCurrentProgress(idx + 1)
          log.info(typeName[obj.type], 'uploading ...', obj.name)
          if (obj.type == 'project') {
            // upload project
            if (isDevelopment) {
              return new Promise((resolve, _reject) => setTimeout(() => resolve(true), 200))
            }
            return uploadProject(obj)
          } else {
            // upload template
            if (isDevelopment) {
              return new Promise((resolve, _reject) => setTimeout(() => resolve(true), 200))
            }
            return saveCustomTemplate(settings.user.id, obj.data)
          }
        })
      }, Promise.resolve())
      allPromises.then(() => {
        fetchFiles(settings.user.id).then(() => {
          // done! Go to the next step
          setCurrentObj(t('Done!'))
          setTimeout(nextStep, 1500)
        })
      })
    }, [settings])

    const uploadProject = (projObj) => {
      // read file
      if (doesFileExist(projObj.path)) {
        const file = JSON.parse(readFileSync(projObj.path))
        // migrate if needed
        migrateIfNeeded(
          appVersion,
          file,
          file.file.fileName,
          null,
          (error, migrated, data) => {
            if (error) {
              log.error('Error migrating file: ', error)
              return
            }
            if (migrated) {
              log.info(
                `File was migrated.  Migration history: ${data.file.appliedMigrations}.  Initial version: ${data.file.initialVersion}`
              )
            }
            extractImages(data, settings.user.id)
              .then((patchedData) =>
                uploadExisting(settings.user.email, settings.user.id, patchedData)
              )
              .then(() => {
                log.info('successfull upload', file.file.fileName)
                removeFromKnownFiles(projObj.id)
              })
              .catch((err) => {
                log.error(file.file.fileName)
                log.error(err)
              })
          },
          log
        )
      }
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
            bsStyle="info"
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
  }

  return Uploading
}

export default UploadingConnector
