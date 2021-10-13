import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { Button, Grid, Row, Col, ListGroupItem, ListGroup } from 'react-bootstrap'
import { t } from 'plottr_locales'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import { Checkbox } from '../../../Checkbox'

const typeMap = {
  characters: t('Character'),
  plotlines: t('Plotline'),
  scenes: t('Scene'),
}

const ChooseConnector = (connector) => {
  const {
    platform: {
      file: { basename },
    },
  } = connector

  const Choose = ({ cancel, finalize, projects, templates }) => {
    const [selectedProjects, setSelectedProjects] = useState(projects.map((p) => p.id))
    const [selectedTemplates, setSelectedTemplates] = useState(templates.map((t) => t.id))

    const makeChoices = () => {
      const finalizedProjects = projects.filter((proj) => selectedProjects.includes(proj.id))
      const finalizedTemplates = templates.filter((temp) => selectedTemplates.includes(temp.id))
      finalize(finalizedProjects, finalizedTemplates)
    }

    const changeProject = (checked, id) => {
      const idx = selectedProjects.indexOf(id)
      let newProjects = [...selectedProjects]
      if (checked) {
        if (idx < 0) newProjects.push(id)
      } else {
        newProjects.splice(idx, 1)
      }
      setSelectedProjects(newProjects)
    }

    const changeTemplate = (checked, id) => {
      const idx = selectedTemplates.indexOf(id)
      let newTemplates = [...selectedTemplates]
      if (checked) {
        if (idx < 0) newTemplates.push(id)
      } else {
        newTemplates.splice(idx, 1)
      }
      setSelectedTemplates(newTemplates)
    }

    const ListProjects = () => {
      return projects.map((proj) => {
        const name = basename(proj.path)
        const isChecked = selectedProjects.includes(proj.id)
        return (
          <ListGroupItem key={proj.id} onClick={() => changeProject(!isChecked, proj.id)}>
            <Checkbox inline checked={isChecked} onChange={(val) => changeProject(val, proj.id)}>
              <span>{name}</span>
            </Checkbox>
            <p className="secondary-text">{proj.path}</p>
          </ListGroupItem>
        )
      })
    }

    const ListTemplates = () => {
      return templates.map((temp) => {
        const isChecked = selectedTemplates.includes(temp.id)
        return (
          <ListGroupItem key={temp.id} onClick={() => changeTemplate(!isChecked, temp.id)}>
            <Checkbox inline checked={isChecked} onChange={(val) => changeTemplate(val, temp.id)}>
              <span>{temp.name}</span>
            </Checkbox>
            <p className="secondary-text">{t('{type} template', { type: typeMap[temp.type] })}</p>
          </ListGroupItem>
        )
      })
    }

    const isDisabled = !selectedProjects.length && !selectedTemplates.length

    return (
      <>
        <StepHeader>
          <h2>{t('Choose what to upload')}</h2>
        </StepHeader>
        <StepBody>
          <Grid>
            <Row>
              <Col size={6} sm={6}>
                <h5>{t('Projects')}</h5>
                <ListGroup>
                  <ListProjects />
                </ListGroup>
              </Col>
              <Col size={6} sm={6}>
                <h5>{t('Templates')}</h5>
                <ListGroup>
                  <ListTemplates />
                </ListGroup>
              </Col>
            </Row>
          </Grid>
        </StepBody>
        <StepFooter>
          <OnboardingButtonBar>
            <Button onClick={cancel}>{t('Go Back')}</Button>
            <Button bsSize="large" onClick={makeChoices} disabled={isDisabled}>
              {t('Upload')}
            </Button>
          </OnboardingButtonBar>
        </StepFooter>
      </>
    )
  }

  Choose.propTypes = {
    cancel: PropTypes.func,
    finalize: PropTypes.func,
    projects: PropTypes.array,
    templates: PropTypes.array,
  }

  return Choose
}

export default ChooseConnector
