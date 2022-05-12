import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { ListGroup } from 'react-bootstrap'

import { t } from 'plottr_locales'

import ListGroupItem from '../../../ListGroupItem'
import Grid from '../../../Grid'
import Col from '../../../Col'
import Row from '../../../Row'
import Button from '../../../Button'
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
    const [selectedProjects, setSelectedProjects] = useState(
      projects.filter(({ path }) => path).map((p) => p.id)
    )
    const [selectedTemplates, setSelectedTemplates] = useState(templates.map((t) => t.id))

    const makeChoices = () => {
      const finalizedProjects = projects.filter((proj) => selectedProjects.includes(proj.id))
      const finalizedTemplates = templates.filter((temp) => selectedTemplates.includes(temp.id))
      finalize(finalizedProjects, finalizedTemplates)
    }

    const toggleProject = (checked, id) => {
      const idx = selectedProjects.indexOf(id)
      let newProjects = [...selectedProjects]
      if (checked) {
        if (idx < 0) newProjects.push(id)
      } else {
        newProjects.splice(idx, 1)
      }
      setSelectedProjects(newProjects)
    }

    const allProjects = () => {
      setSelectedProjects(projects.map((p) => p.id))
    }

    const noneProjects = () => {
      setSelectedProjects([])
    }

    const toggleTemplate = (checked, id) => {
      const idx = selectedTemplates.indexOf(id)
      let newTemplates = [...selectedTemplates]
      if (checked) {
        if (idx < 0) newTemplates.push(id)
      } else {
        newTemplates.splice(idx, 1)
      }
      setSelectedTemplates(newTemplates)
    }

    const allTemplates = () => {
      setSelectedTemplates(templates.map((p) => p.id))
    }

    const noneTemplates = () => {
      setSelectedTemplates([])
    }

    const ListProjects = () => {
      return projects
        .filter(({ path }) => path)
        .map((proj) => {
          const name = basename(proj.path)
          const isChecked = selectedProjects.includes(proj.id)
          return (
            <ListGroupItem key={proj.id} onClick={() => toggleProject(!isChecked, proj.id)}>
              <Checkbox inline checked={isChecked} onChange={(val) => toggleProject(val, proj.id)}>
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
          <ListGroupItem key={temp.id} onClick={() => toggleTemplate(!isChecked, temp.id)}>
            <Checkbox inline checked={isChecked} onChange={(val) => toggleTemplate(val, temp.id)}>
              <span>{temp.name}</span>
            </Checkbox>
            <p className="secondary-text">{t('{type} template', { type: typeMap[temp.type] })}</p>
          </ListGroupItem>
        )
      })
    }

    return (
      <>
        <StepHeader>
          <h2>{t('Choose what to upload')}</h2>
        </StepHeader>
        <StepBody>
          <Grid>
            <Row>
              <Col size={6} sm={6}>
                <h5 className="with-links">
                  <span>{t('Projects')}</span>
                  <small>
                    <a href="#" onClick={allProjects}>
                      {t('All')}
                    </a>
                    <span>|</span>
                    <a href="#" onClick={noneProjects}>
                      {t('None')}
                    </a>
                  </small>
                </h5>
              </Col>
              <Col size={6} sm={6}>
                <h5 className="with-links">
                  <span>{t('Templates')}</span>
                  <small>
                    <a href="#" onClick={allTemplates}>
                      {t('All')}
                    </a>
                    <span>|</span>
                    <a href="#" onClick={noneTemplates}>
                      {t('None')}
                    </a>
                  </small>
                </h5>
              </Col>
            </Row>
            <Row className="onboarding__scrolling-wrapper">
              <Col size={6} sm={6}>
                <ListGroup className="onboarding__scrolling-list">
                  <ListProjects />
                </ListGroup>
              </Col>
              <Col size={6} sm={6}>
                <ListGroup className="onboarding__scrolling-list">
                  <ListTemplates />
                </ListGroup>
              </Col>
            </Row>
          </Grid>
        </StepBody>
        <StepFooter>
          <OnboardingButtonBar>
            <Button onClick={cancel}>{t('Go Back')}</Button>
            <Button bsSize="large" bsStyle="success" onClick={makeChoices}>
              {t('Upload')}
            </Button>
          </OnboardingButtonBar>
        </StepFooter>
      </>
    )
  }

  Choose.propTypes = {
    cancel: PropTypes.func.isRequired,
    finalize: PropTypes.func.isRequired,
    projects: PropTypes.array.isRequired,
    templates: PropTypes.array.isRequired,
  }

  return Choose
}

export default ChooseConnector
