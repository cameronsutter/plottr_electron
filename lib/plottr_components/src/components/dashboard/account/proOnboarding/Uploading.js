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
      file: { basename },
      log,
    },
  } = connector

  const Uploading = ({ nextStep, projects, templates }) => {
    const [progressMax, setProgressMax] = useState(100)
    const [progressCurrent, setProgressCurrent] = useState(1)
    const [currentObj, setCurrentObj] = useState(null)

    useEffect(() => {
      const toUpload = []
      projects.forEach((pr) => {
        toUpload.push({ type: 'project', path: pr.path, name: basename(pr.path) })
      })
      templates.forEach((tm) => {
        toUpload.push({ type: 'template', id: tm.id, data: tm.data, name: tm.name })
      })
      // beging uploading
      setProgressMax(toUpload.length)
      toUpload.forEach((obj, idx) => {
        setCurrentObj(`${typeName[obj.type]}: ${obj.name}`)
        setProgressCurrent(idx + 1)
        log.info(typeName[obj.type], 'uploading ...', obj.name)
        if (obj.type == 'project') {
          // read file
          // upload project
        } else {
          // upload template
        }
      })
      // done! Go to the next step
      setCurrentObj(t('Done!'))
      setTimeout(nextStep, 1500)
    }, [])

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
          <p>{currentObj}</p>
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
