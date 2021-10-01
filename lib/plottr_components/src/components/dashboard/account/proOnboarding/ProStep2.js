import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody } from '../../../onboarding/Step'
import { Spinner } from '../../../Spinner'
import UnconnectedUploading from './Uploading'
import UnconnectedChoose from './Choose'

const isPlottrCloudFile = (filePath) => filePath && filePath.startsWith('plottr://')
// needs to be declared here otherwise it will cause an infinite loop since we'd be passing in a new [] every render
const initialFrbFiles = []

const ProStep2Connector = (connector) => {
  const {
    platform: {
      file: { useSortedKnownFiles },
      template: { useCustomTemplatesInfo },
    },
  } = connector

  const Uploading = UnconnectedUploading(connector)
  const Choose = UnconnectedChoose(connector)

  const ProStep2 = ({ nextStep }) => {
    const [sortedIds, filesById] = useSortedKnownFiles('', initialFrbFiles)
    const [templateInfo] = useCustomTemplatesInfo()
    const [nothing, setNothing] = useState(false)
    const [view, setView] = useState('choice')
    const [templates, setTemplates] = useState(null)
    const [projects, setProjects] = useState(null)

    useEffect(() => {
      // TODO: figure out what to do with templates/projects already in firebase

      // discover all templates
      const templatesList = Object.values(templateInfo)
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
        setNothing(true)
      } else {
        setNothing(false)
      }
    }, [sortedIds, templateInfo])

    useEffect(() => {
      // there's nothing to upload
      if (templateInfo && sortedIds && nothing) nextStep()
    }, [nothing])

    const finalizeChoices = (selectedProjects, selectedTemplates) => {
      setProjects(selectedProjects)
      setTemplates(selectedTemplates)
      setView('upload')
    }

    if (!templates && !projects && !nothing) {
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
            projects={projects}
            templates={templates}
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
  }

  return ProStep2
}

export default ProStep2Connector
