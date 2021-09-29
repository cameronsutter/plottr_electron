import React, { useEffect, useState } from 'react'
import PropTypes from 'react-proptypes'
import { ProgressBar } from 'react-bootstrap'
import { t } from 'plottr_locales'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'

const typeName = {
  project: t('Project'),
  template: t('Template'),
}

const UploadingConnector = (connector) => {
  const {
    platform: {
      file: { basename, doesFileExist, readFileSync, editKnownFilePath },
      firebase: { saveCustomTemplate, uploadExisting },
      log,
      useSettingsInfo,
      appVersion,
    },
    pltr: { migrateIfNeeded },
  } = connector

  const Uploading = ({ nextStep, projects, templates }) => {
    const [settings] = useSettingsInfo()
    const [progressMax, setProgressMax] = useState(100)
    const [progressCurrent, setProgressCurrent] = useState(1)
    const [currentObj, setCurrentObj] = useState(null)

    useEffect(() => {
      if (!settings.user || !settings.user.id) return
      const toUpload = []
      projects.forEach((pr) => {
        toUpload.push({ type: 'project', path: pr.path, name: basename(pr.path) })
      })
      templates.forEach((tm) => {
        toUpload.push({ type: 'template', id: tm.id, data: tm, name: tm.name })
      })
      // beging uploading
      setProgressMax(toUpload.length)
      const allPromises = toUpload.reduce((p, obj, idx) => {
        return p.then(() => {
          setCurrentObj(`${typeName[obj.type]}: ${obj.name}`)
          setProgressCurrent(idx + 1)
          log.info(typeName[obj.type], 'uploading ...', obj.name)
          if (obj.type == 'project') {
            // return new Promise((resolve, _reject) => {
            //   setTimeout(() => resolve(), 100)
            // })
            // upload project
            return uploadProject(obj)
          } else {
            // return new Promise((resolve, _reject) => {
            //   setTimeout(() => resolve(), 100)
            // })
            // upload template
            return saveCustomTemplate(settings.user.id, obj.data)
          }
        })
      }, Promise.resolve())
      allPromises.then(() => {
        // done! Go to the next step
        setCurrentObj(t('Done!'))
        setTimeout(nextStep, 1500)
      })
    }, [settings])

    const uploadProject = (projObj) => {
      // read file
      if (doesFileExist(projObj.path)) {
        const file = JSON.parse(readFileSync(projObj.path))
        // migrate if needed
        migrateIfNeeded(appVersion, file, file.file.fileName, null, (error, migrated, data) => {
          if (error) {
            log.error('Error migrating file: ', error)
            return
          }
          if (migrated) {
            log.info(
              `File was migrated.  Migration history: ${data.file.appliedMigrations}.  Initial version: ${data.file.initialVersion}`
            )
          }
          // TODO: test that this function works (follow it's stack and make sure it has the emailAddress & userId)
          return uploadExisting(data).then((response) => {
            // change the entry in the knownFiles
            const newPath = `plottr://${response.data.fileId}`
            editKnownFilePath(projObj.path, newPath)
          })
        })
      }
    }

    return (
      <>
        <StepHeader>
          <h2>{t('Uploading...')}</h2>
        </StepHeader>
        <StepBody>
          <ProgressBar
            now={progressCurrent}
            max={progressMax}
            label={`${progressCurrent}/${progressMax}`}
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
