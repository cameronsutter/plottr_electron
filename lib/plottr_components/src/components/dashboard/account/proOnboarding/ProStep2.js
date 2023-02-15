import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'react-proptypes'

import { helpers } from 'pltr/v2'
import { t } from 'plottr_locales'

import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody } from '../../../onboarding/Step'
import { Spinner } from '../../../Spinner'
import UnconnectedUploading from './Uploading'
import UnconnectedChoose from './Choose'
import { checkDependencies } from '../../../checkDependencies'

const ProStep2Connector = (connector) => {
  const Uploading = UnconnectedUploading(connector)
  const Choose = UnconnectedChoose(connector)

  const {
    platform: {
      file: { doesFileExist },
    },
  } = connector
  checkDependencies({ doesFileExist })

  const ProStep2 = ({ nextStep, fileSystemCustomTemplates, fileSystemKnownFiles }) => {
    const [nothingToUpload, setNothingToUpload] = useState(null)
    const [view, setView] = useState('choice')
    const [templates, setTemplates] = useState(null)
    const [projects, setProjects] = useState(null)
    const emptyList = useRef([])

    useEffect(() => {
      // discover all templates
      const templatesList = fileSystemCustomTemplates
      if (!templates && templatesList.length) {
        setTemplates(templatesList)
      }
      // discover all projects
      if (!projects && fileSystemKnownFiles.length) {
        Promise.all(
          fileSystemKnownFiles.reduce((acc, project) => {
            if (!helpers.file.urlPointsToPlottrCloud(project.fileURL)) {
              return [
                ...acc,
                doesFileExist(project.fileURL).then((exists) => {
                  if (exists) {
                    return project
                  } else {
                    return null
                  }
                }),
              ]
            }
            return acc
          }, [])
        ).then((projectsToUpload) => {
          setProjects(projectsToUpload.filter(Boolean))
        })
      }

      if (!templatesList.length && !fileSystemKnownFiles.length) {
        setNothingToUpload(true)
      }
    }, [fileSystemKnownFiles, fileSystemCustomTemplates])

    useEffect(() => {
      // there's nothing to upload
      if (fileSystemCustomTemplates && fileSystemKnownFiles && nothingToUpload) nextStep()
    }, [fileSystemKnownFiles, fileSystemCustomTemplates, nothingToUpload])

    const finalizeChoices = (selectedProjects, selectedTemplates) => {
      setProjects(selectedProjects)
      setTemplates(selectedTemplates)
      setView('upload')
    }

    if (!templates && !projects && !nothingToUpload) {
      return (
        <StepBody>
          <Spinner />
        </StepBody>
      )
    }

    let body = null
    switch (view) {
      case 'choose':
        body = (
          <Choose
            cancel={() => setView('choice')}
            finalize={finalizeChoices}
            projects={projects || emptyList.current}
            templates={templates || emptyList.current}
          />
        )
        break
      case 'upload':
        body = <Uploading nextStep={nextStep} projects={projects} templates={templates} />
        break
      case 'choice':
      default:
        body = (
          <StepBody>
            <div className="verify__chooser">
              <div className="verify__choice" onClick={() => setView('upload')}>
                <h2>{t('Upload ALL projects & templates')}</h2>
              </div>
              <div className="verify__choice" onClick={() => setView('choose')}>
                <h2>{t('Choose what to upload')}</h2>
              </div>
            </div>
          </StepBody>
        )
        break
    }

    return <OnboardingStep>{body}</OnboardingStep>
  }

  ProStep2.propTypes = {
    nextStep: PropTypes.func,
    fileSystemCustomTemplates: PropTypes.array.isRequired,
    fileSystemKnownFiles: PropTypes.array.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      fileSystemCustomTemplates: selectors.fileSystemCustomTemplatesSelector(state.present),
      fileSystemKnownFiles: selectors.fileSystemKnownFilesSelector(state.present),
    }))(ProStep2)
  }

  throw new Error('Could not connect ProStep2')
}

export default ProStep2Connector
