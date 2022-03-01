import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody } from '../../../onboarding/Step'
import { Spinner } from '../../../Spinner'
import UnconnectedUploading from './Uploading'
import UnconnectedChoose from './Choose'

const isPlottrCloudFile = (filePath) => filePath && filePath.startsWith('plottr://')

const ProStep2Connector = (connector) => {
  const Uploading = UnconnectedUploading(connector)
  const Choose = UnconnectedChoose(connector)

  const ProStep2 = ({ nextStep, fileSystemCustomTemplates, sortedFileSystemKnownFilesById }) => {
    const [sortedIds, filesById] = sortedFileSystemKnownFilesById
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
      if (!projects && sortedIds.length) {
        const projectsToUpload = sortedIds.reduce((acc, id) => {
          const project = filesById[id]
          if (!isPlottrCloudFile(project.path)) {
            acc.push({ ...project, id })
          }
          return acc
        }, [])
        setProjects(projectsToUpload)
      }

      if (!templatesList.length && !sortedIds.length) {
        setNothingToUpload(true)
      }
    }, [sortedIds, fileSystemCustomTemplates])

    useEffect(() => {
      // there's nothing to upload
      if (fileSystemCustomTemplates && sortedIds && nothingToUpload) nextStep()
    }, [sortedIds, fileSystemCustomTemplates, nothingToUpload])

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
    sortedFileSystemKnownFilesById: PropTypes.array.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      fileSystemCustomTemplates: selectors.fileSystemCustomTemplatesSelector(state.present),
      sortedFileSystemKnownFilesById: selectors.sortedFileSystemKnownFilesByIdSelector(
        state.present
      ),
    }))(ProStep2)
  }

  throw new Error('Could not connect ProStep2')
}

export default ProStep2Connector
